import React, { useEffect, useState, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, getUserDetails, updateUser } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { Box, Button, Collapse, IconButton, Table, TableBody, TableHead, Typography, Tab, Paper, BottomNavigation, BottomNavigationAction, Container } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields } from '../../redux/studentRelated/studentHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import CustomPieChart from '../../components/CustomPieChart'
import { StyledTableCell, StyledTableRow } from '../../components/styles';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../components/Popup';
import { PurpleButton } from '../../components/buttonStyles';

const ViewParentStudent = () => {
    const [showTab, setShowTab] = useState(false);

    const navigate = useNavigate()
    const params = useParams()
    const componentRef = useRef()
    const dispatch = useDispatch()
    const { userDetails, response, loading, error } = useSelector((state) => state.user);
    const studentID = params.id
    const address = "Student"

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID])

    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id !== undefined) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [selectedSection, setSelectedSection] = useState('table');
    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const fields = password === ""
        ? { name, rollNum }
        : { name, rollNum, password }

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setRollNum(userDetails.rollNum || '');
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const submitHandler = (event) => {
        event.preventDefault()
        dispatch(updateUser(fields, studentID, address))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            })
            .catch((error) => {
                console.error(error)
            })
    }

    const deleteHandler = () => {
        dispatch(deleteUser(studentID, address))
            .then(() => {
                navigate(-1)
            })
    }

    // const removeHandler = (id, deladdress) => {
    //     dispatch(removeStuff(id, deladdress))
    //         .then(() => {
    //             dispatch(getUserDetails(studentID, address));
    //         })
    // }

    // const removeSubAttendance = (subId) => {
    //     dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
    //         .then(() => {
    //             dispatch(getUserDetails(studentID, address));
    //         })
    // }

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { subCode, present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const StudentAttendanceSection = () => {
        const renderTableSection = () => {
            return (
                <>
                    <h3>Attendance</h3>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Subject</StyledTableCell>
                                <StyledTableCell>Present</StyledTableCell>
                                <StyledTableCell>Total Sessions</StyledTableCell>
                                <StyledTableCell>Attendance Percentage</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                            const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                            return (
                                <TableBody key={index}>
                                    <StyledTableRow>
                                        <StyledTableCell>{subName}</StyledTableCell>
                                        <StyledTableCell>{present}</StyledTableCell>
                                        <StyledTableCell>{sessions}</StyledTableCell>
                                        <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Button variant="contained"
                                                onClick={() => handleOpen(subId)}>
                                                {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}Details
                                            </Button>
                                            {/* <IconButton onClick={() => removeSubAttendance(subId)}>
                                                <DeleteIcon color="error" />
                                            </IconButton> */}
                                            {/* <Button variant="contained" sx={styles.attendanceButton}
                                                onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${subId}`)}>
                                                Change
                                            </Button> */}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 1 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Attendance Details
                                                    </Typography>
                                                    <Table size="small" aria-label="purchases">
                                                        <TableHead>
                                                            <StyledTableRow>
                                                                <StyledTableCell>Date</StyledTableCell>
                                                                <StyledTableCell align="right">Status</StyledTableCell>
                                                            </StyledTableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {allData.map((data, index) => {
                                                                const date = new Date(data.date);
                                                                const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                return (
                                                                    <StyledTableRow key={index}>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {dateString}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                    </StyledTableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableBody>
                            )
                        }
                        )}
                    </Table>
                    <div>
                        Overall Attendance Percentage: {overallAttendancePercentage.toFixed(2)}%
                    </div>
                    {/* <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => removeHandler(studentID, "RemoveStudentAtten")}>Delete All</Button>
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/attendance/" + studentID)}>
                        Add Attendance
                    </Button> */}
                </>
            )
        }
        const renderChartSection = () => {
            return (
                <>
                    <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                </>
            )
        }
        return (
            <>
                {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0
                    ?
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}

                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Table"
                                    value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Chart"
                                    value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                    :
                    <div>Please be informed that {name} does not have any record of attendance.</div>
                }
            </>
        )
    }

    const StudentMarksSection = () => {
        const renderTableSection = () => {
            return (
                <>
                    <div ref={componentRef}>
                    <h3>Statement of Result</h3>
                    <p>Roll Number: {`${userDetails.rollNum}`}</p>
                    <p>Name: {`${userDetails.firstName} ${userDetails.middleName} ${userDetails.lastName}`}</p>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Subject</StyledTableCell>
                                <StyledTableCell>Score</StyledTableCell>
                                <StyledTableCell>Grade</StyledTableCell>
                                <StyledTableCell>Remarks</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {subjectMarks.map((result, index) => {
                                if (!result.subName || !result.marksObtained) {
                                    return null;
                                }
                                return (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                        <StyledTableCell>{result.marksObtained}%</StyledTableCell>
                                        <StyledTableCell>
                                        {
                                        result.marksObtained <=39.99 ? 'F9' : 
                                        result.marksObtained >=40 && result.marksObtained <=44.99 ? 'E8' : 
                                        result.marksObtained >=45 && result.marksObtained <=49.99 ? 'D7' :
                                        result.marksObtained >=50 && result.marksObtained <=54.99 ? 'C6' :
                                        result.marksObtained >=55 && result.marksObtained <=59.99 ? 'C5' :
                                        result.marksObtained >=60 && result.marksObtained <=64.99 ? 'C4' :
                                        result.marksObtained >=65 && result.marksObtained <=69.99 ? 'B3' :
                                        result.marksObtained >=70 && result.marksObtained <=74.99 ? 'B2' :
                                        result.marksObtained >=75 && result.marksObtained <=100 ? 'A1' : 'NA'
                                        }
                                        </StyledTableCell>
                                        <StyledTableCell>
                                        {
                                        result.marksObtained <=39.99 ? 'Fail' : 
                                        result.marksObtained >=40 && result.marksObtained <=44.99 ? 'Pass' : 
                                        result.marksObtained >=45 && result.marksObtained <=49.99 ? 'Pass' :
                                        result.marksObtained >=50 && result.marksObtained <=54.99 ? 'Credit' :
                                        result.marksObtained >=55 && result.marksObtained <=59.99 ? 'Credit' :
                                        result.marksObtained >=60 && result.marksObtained <=64.99 ? 'Credit' :
                                        result.marksObtained >=65 && result.marksObtained <=69.99 ? 'Good' :
                                        result.marksObtained >=70 && result.marksObtained <=74.99 ? 'Very Good' :
                                        result.marksObtained >=75 && result.marksObtained <=100 ? 'Excellent' : 'NA'
                                        }
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    </div>
                    <br />
                    <ReactToPrint
                        trigger={() => <PurpleButton>Print out</PurpleButton>}
                        content={() => componentRef.current}
                        pageStyle="@page { size: 8.3in 11.7in }"
                    />
                </>
            )
        }
        const renderChartSection = () => {
            return (
                <>
                    <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                </>
            )
        }
        return (
            <>
                {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0
                    ?
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}

                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Table"
                                    value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Chart"
                                    value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                    :
                    <div>Please be informed that {name} does not have any mark recorded.</div>
                }
            </>
        )
    }

    const StudentDetailsSection = () => {
        return (
            <div>
                First Name: {userDetails.firstName}
                <br />
                Middle Name: {userDetails.middleName}
                <br />
                Last Name: {userDetails.lastName}
                <br />
                Date of Birth: {userDetails.dob}
                <br />
                Gender: {userDetails.gender}
                <br />
                Phone: {userDetails.phoneNo}
                <br />
                Email: {userDetails.email}
                <br />
                Class: {sclassName.sclassName}
                <br />
                Enrolment Status: {userDetails.enrolmentStatus}
                <br />
                Roll Number: {userDetails.rollNum}
                <br />
                Address: {userDetails.address}
                <br />
                School: {studentSchool.schoolName}
                {
                    subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                        <CustomPieChart data={chartData} />
                    )
                }
                {/* <Button variant="contained" sx={styles.styledButton} onClick={deleteHandler}>
                    Delete
                </Button>
                <br /> */}
                {/* <Button variant="contained" sx={styles.styledButton} className="show-tab" onClick={() => { setShowTab(!showTab) }}>
                    {
                        showTab
                            ? <KeyboardArrowUp />
                            : <KeyboardArrowDown />
                    }
                    Edit Student
                </Button>
                <Collapse in={showTab} timeout="auto" unmountOnExit>
                    <div className="register">
                        <form className="registerForm" onSubmit={submitHandler}>
                            <span className="registerTitle">Edit Details</span>
                            <label>Name</label>
                            <input className="registerInput" type="text" placeholder="Enter user's name..."
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name" required />

                            <label>Roll Number</label>
                            <input className="registerInput" type="number" placeholder="Enter user's Roll Number..."
                                value={rollNum}
                                onChange={(event) => setRollNum(event.target.value)}
                                required />

                            <label>Password</label>
                            <input className="registerInput" type="password" placeholder="Enter user's password..."
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password" />

                            <button className="registerButton" type="submit" >Update</button>
                        </form>
                    </div>
                </Collapse> */}
            </div>
        )
    }

    return (
        <>
            {loading
                ?
                <>
                    <div>Please Wait...</div>
                </>
                :
                <>
                    <Box sx={{ width: '100%', typography: 'body1', }} >
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                    <Tab label="Details" value="1" />
                                    <Tab label="Attendance" value="2" />
                                    <Tab label="Marks" value="3" />
                                </TabList>
                            </Box>
                            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                                <TabPanel value="1">
                                    <StudentDetailsSection />
                                </TabPanel>
                                <TabPanel value="2">
                                    <StudentAttendanceSection />
                                </TabPanel>
                                <TabPanel value="3">
                                    <StudentMarksSection />
                                </TabPanel>
                            </Container>
                        </TabContext>
                    </Box>
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

        </>
    )
}

export default ViewParentStudent

const styles = {
    attendanceButton: {
        marginLeft: "20px",
        backgroundColor: "#270843",
        "&:hover": {
            backgroundColor: "#3f1068",
        }
    },
    styledButton: {
        margin: "20px",
        backgroundColor: "#02250b",
        "&:hover": {
            backgroundColor: "#106312",
        }
    }
}