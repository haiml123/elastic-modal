// @ts-nocheck
import React, { useEffect, useState} from 'react';
import './App.css';
import {createPopup, useElasticModal} from "./elastic-modal/elastic-modal.provider";
import {ElasticPopupEvents} from "./elastic-modal/elastic-modal.types";
import MinimizePlugin from "./elastic-modal/extra-plugins/minimize.plugin";
import Home from "./website/Home";
import AppCard from "./website/card/card";
import {Button, Typography} from "@mui/material";


export default function App() {

    const alert1 = useElasticModal(createPopup(Alert), {message: 'hello'}, {popupClasses: 'example-class'});
    // const alert2 = useElasticModal(createPopup(Alert), {message: 'hello'}, {position: {top: 'top', left: 'right'}, customPluginField: 'field1'});
    // const alert3 = useElasticModal(createPopup(Alert), {message: 'hello'}, {position: {top: 'center', left: 'center'}});

    useEffect(() => {
        const unsubscribe = alert1.on(ElasticPopupEvents.ON_SHOW, (res) => {
            console.log('show event', res);
        });
        return () => {
            unsubscribe();
        }
    }, [alert]);

    const openModal = (e: any) => {
        alert1.show({message: 'hello'}, {});
    }

    const openPopover = (e) => {
        alert1.show({message: 'hello'}, {position: { top: 'bottom', left: 'left'}, target: e.target});
    }

    return (
        <div className="App">
            <Home>
                <AppCard>
                    <div>
                        <Typography>
                            Popover
                        </Typography>
                    </div>
                    <Button variant="contained" onClick={(e) => openPopover(e)}>Show</Button>
                </AppCard>

                <AppCard>
                    <div>
                        <Typography>
                             Modal
                        </Typography>
                    </div>
                    <Button variant="contained" onClick={(e) => openModal(e)}>Show</Button>
                </AppCard>
            </Home>
        </div>
    );
}

// GENERIC PROMPT COMPONENT
const Prompt = function (props) {
    const [promptValue, setPromptValue] = useState("");
    const {message, close} = props;

    return (
        <div>
            <h1>Question</h1>
            <p>{message}</p>
            <input
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
            />
            <div>
                <button onClick={() => close(false)}>cancel</button>
                <button onClick={() => close(promptValue)}>ok</button>
            </div>
        </div>
    );
};

// GENERIC ALERT COMPONENT
const Alert2 = function (props) {
    const ref = useElasticModal();
    // console.log('cool=>', ref);
    const {message} = props;
    // console.log(props);

    return (
        <div>
            <h1>Alert</h1>
            <p>{message}</p>
            <button onClick={() => ref.hide()}>ok</button>
        </div>
    );
};


// GENERIC ALERT COMPONENT
const Alert = function (props) {
    const {id, hide, show} = useElasticModal();
    const title = "Popup";
    const PopupHeader = MinimizePlugin.PopupHeader;
    return (
        <div style={{display: 'flex', flexDirection: 'column', background: 'white', width: '100%'}}>
            <PopupHeader title={title} {...props} />
            <div style={{padding: '10px'}}>
                <Typography>
                    Let Google help apps determine location. This means sending anonymous
                    location data to Google, even when no apps are running.
                </Typography>
            </div>
        </div>
    );
};

