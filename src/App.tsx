import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';

const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [stocksFile, setStocksFile] = useState<File | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchUploadStatus();
  }, [currentDate]);

  const fetchUploadStatus = async () => {
    try {
      const response = await fetch("https://82qww13oi0.execute-api.ap-south-1.amazonaws.com/D2/Anamay_CalenderUpdate_Prod");
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        setUploadStatus(data);
      } else {
        console.error("Failed to fetch upload status, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  };

   const getDateColor = (date: string): string => {
    if (uploadStatus[date]) return uploadStatus[date];
    const today = new Date();
    const givenDate = new Date(date);
    const marchFirst = new Date(2025, 2, 1);
    if (givenDate >= marchFirst && givenDate <= today) {
      return "#ffa366";
    }
    return "white";
  };
  
  // Validate file type
  const validateFile = (file: File | null): boolean => {
    if (file && file.name.endsWith(".csv")) {
      return true;
    }
    alert("Please upload a valid CSV file.");
    return false;
  };

    // Upload file function
  const uploadFile = async (file: File | null, apiUrl: string) => {
    if (!file) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.message || "File uploaded successfully!");
      } else {
        const errorText = await response.text();
        setResponseMessage(`Failed to upload file: ${errorText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("An error occurred while uploading the file.");
    }

    setIsModalOpen(true); // Open the modal when response is received
  };


  const renderCalendar = (date: Date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<td key={`empty-${i}`} className="empty"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isSunday = new Date(date.getFullYear(), date.getMonth(), day).getDay() === 0;
      const color = isSunday && uploadStatus[dateString] === "#ffffff" ? "white" : getDateColor(dateString);
      const tooltipText = color === "#9fff80" ? "Stocks and Sales file uploaded" : 
                         color === "#ffff66" ? "Sales data not updated" : dateString;

      daysArray.push(
        <td key={day} className="day" style={{ backgroundColor: color, textAlign: 'center' }}>
          <div className="tooltip-wrapper">
            {day}
            <span className="tooltip">{tooltipText}</span>
          </div>
        </td>
      );
    }

    const weeks = [];
    let week = [];
    for (let i = 0; i < daysArray.length; i++) {
      week.push(daysArray[i]);
      if (week.length === 7) {
        weeks.push(<tr key={`week-${weeks.length}`}>{week}</tr>);
        week = [];
      }
    }
    if (week.length > 0) {
      weeks.push(<tr key={`week-${weeks.length}`}>{week}</tr>);
    }

    return (
      <table className="calendar-table" style={{ padding: '10px', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%' }}>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>{weeks}</tbody>
      </table>
    );
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

    


  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '90vw', backgroundColor: '#f8f8ff' }}>
      <header style={{ width: '100%' }}>
        <div style={{ width: '130px', height: '90px', overflow: 'hidden', borderRadius: '8px' }}>
          <img
            style={{ padding: '10px', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%' }}
            src="https://media.licdn.com/dms/image/v2/C560BAQFim2B73E6nkA/company-logo_200_200/company-logo_200_200/0/1644228681907/anamaybiotech_logo?e=2147483647&v=beta&t=RnXx4q1rMdk6bI5vKLGU6_rtJuF0hh_1ycTPmWxgZDo"
            alt="Company Logo"
            className="logo"
          />
        </div>
        <button style={{ marginLeft: 'auto', marginRight: '20px' }} onClick={signOut}>
          Sign out
        </button>
      </header>

      <h1 style={{ padding: '10px', textAlign: 'center', width: '100vw' }}>
        <u>Anamay - Dashboard Update Interface</u>
      </h1>

      {/* Stocks File Upload */}
      <div>
        <h2>&emsp;&emsp;Anamay Stocks</h2>
        <p style={{ padding: '10px', backgroundColor: '#e6e6e6', borderRadius: '8px', width: '50vw', height: '70px', float: 'left' }}>
          &emsp;&emsp;&emsp;&emsp;
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setStocksFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => {
              if (validateFile(stocksFile)) {
                uploadFile(stocksFile, "https://qvls5frwcc.execute-api.ap-south-1.amazonaws.com/V1/UploadLink_Anamay");
              }
            }}
          >
            Submit Stocks File
          </button>
        </p>
      </div>

      <hr />

      {/* Sales File Upload */}
      <div>
        <h2>&emsp;&emsp;Anamay Sales</h2>
        <p style={{ padding: '10px', backgroundColor: '#e6e6e6', borderRadius: '8px', width: '50vw', height: '70px' }}>
          &emsp;&emsp;&emsp;&emsp;
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSalesFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => {
              if (validateFile(salesFile)) {
                uploadFile(salesFile, "https://azjfhu323b.execute-api.ap-south-1.amazonaws.com/S1/UploadLinkAnamay_Sales");
              }
            }}
          >
            Submit Sales File
          </button>
        </p>
      </div>

      
      {responseMessage && <p>{responseMessage}</p>}

      {/* Calendar Component */}
      <div
        style={{
          position: 'absolute',
          top: '40vh',
          right: '10vw',
          width: '25vw',
          padding: '0px',
          backgroundColor: '#e6f7ff',
          borderRadius: '8px',
        }}
      >
       <h3 style={{ textAlign: 'center' }}>Calendar (daily tracker)</h3>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={prevMonth}>&lt; </button>
          <span style={{ margin: '0 10px' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth}>&gt; </button>
        </div>
        {renderCalendar(currentDate)}
      </div>


      {/* Modal Popup */}
      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Upload Status</h2>
            <p>{responseMessage}</p>
            <div style={modalStyles.buttonContainer}>
              <button style={modalStyles.button} onClick={() => setIsModalOpen(false)}>OK</button>
               {/*<button style={{ ...modalStyles.button, backgroundColor: 'red' }} onClick={() => setIsModalOpen(false)}>Close</button>*/}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// Modal Styles
const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    width: '300px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  buttonContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007BFF',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default App;
