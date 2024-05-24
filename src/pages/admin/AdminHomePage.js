import { Container, Grid, Paper } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Parents from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getAllParents } from '../../redux/parentRelated/parentHandle';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { parentsList } = useSelector((state) => state.parent);

    const { currentUser } = useSelector(state => state.user)

    const adminID = currentUser._id

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
        dispatch(getAllParents(adminID));
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;
    const numberOfParents = parentsList && parentsList.length;

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={2.4} lg={2.4}>
                        <StyledPaper>
                            <img src={Students} alt="Students" />
                            <Title>
                                Total Students
                            </Title>
                            <Data start={0} end={numberOfStudents} duration={3} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={2.4} lg={2.4}>
                        <StyledPaper>
                            <img src={Classes} alt="Classes" />
                            <Title>
                                Total Classes
                            </Title>
                            <Data start={0} end={numberOfClasses} duration={3} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={2.4} lg={2.4}>
                        <StyledPaper>
                            <img src={Teachers} alt="Teachers" />
                            <Title>
                                Total Teachers
                            </Title>
                            <Data start={0} end={numberOfTeachers} duration={3} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={2.4} lg={2.4}>
                        <StyledPaper>
                            <img src={Parents} alt="Parents" />
                            <Title>
                                Total Parents
                            </Title>
                            <Data start={0} end={numberOfParents} duration={3} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={2.4} lg={2.4}>
                        <StyledPaper>
                            <img src={Fees} alt="Fees" />
                            <Title>
                                Fees Collection
                            </Title>
                            <Data start={0} end={990000000} duration={3} prefix="&#8358;" />                        
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};


const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default AdminHomePage