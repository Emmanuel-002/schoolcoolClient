import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import Popup from '../components/Popup';
import { BlueButton } from '../components/buttonStyles';
import { addStuff } from '../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SendMessage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, currentUser, error } = useSelector(state => state.user);
    const authorID = currentUser._id;
    const authorName = currentUser.name;
    const address = "Message";
    const [recipientEmail, setRecipientEmail]  = useState('');
    const [responseBody, setResponseBody] = useState({});
    const [messageBody, setMessageBody] = useState({
        text:{
            authorEmail: currentUser.email,
            authorID: currentUser._id
        }
    });

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {authorID, recipientEmail, authorName, messageBody,  responseBody };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
        navigate("/Parent/messages")
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Your message has been sent")
        }
        else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Network Error")
        }
    }, [status, error])

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        maxWidth: 550,
                        px: 3,
                        py: '100px',
                        width: '100%'
                    }}
                >
                    <div>
                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography variant="h4">Message Form</Typography>
                        </Stack>
                        <form onSubmit={submitHandler}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Target Email"
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(event) => setRecipientEmail(event.target.value)} 
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Title"
                                    type="text"
                                    value={messageBody.text?.title}
                                    onChange={(event) => setMessageBody({
                                        text:{
                                            ...messageBody.text,
                                        title: event.target.value,
                                        }
                                    })} 
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Write your message"
                                    variant="outlined"
                                    value={messageBody.text?.body}
                                    onChange={(event) => {
                                        setMessageBody({
                                        text: {
                                            ...messageBody.text,
                                            body: event.target.value,
                                        }   
                                        });
                                    }}
                                    required
                                    multiline
                                    maxRows={4}
                                />
                            </Stack>
                            <BlueButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                            </BlueButton>
                        </form>
                    </div>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default SendMessage;