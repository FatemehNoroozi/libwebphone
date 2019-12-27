import { maxHeaderSize } from "http";

//Last modified: 27/Dec/2019

//variable for phone functionalities and session
let phone;
var sTransferNumber;
var oRingTone, oRingbackTone;
var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;
var videoRemote, videoLocal, audioRemote;
var bFullScreen = false;
var oNotifICall;
var bDisableVideo = false;
var viewVideoLocal, viewVideoRemote;
var oConfigCall;
var oReadyStateTimer;
var oSipSessionRegister, onSipEventSession, onSipEventStack;
var getPVal;
var preInit;

//varibale for phone component
var txtRegStatus;
var txtCallStatus;
var btnCallAudio;
var btnCallMuteUnmute;
var btnHoldResume;
var btnHangup;
var btnTransfer;
var btnCallVideo;
var btnStopVideoSharing;
var txtDestinationnumber;
var txtTransferCall;
var registerSession;
var btnaddtoparklist;
var callparkcontainer;
var divforparkunpark;


//Variable for Volumene meter and local video preview
//component variable 
var btngetaudioevices;
var cmbmediadevicelistvideo;
var videoElement;
var btngetvideodevices;
var cmbmediadevicelistaudio;
var startvideopreview;
var stopvideopreview;
var btnpreviewmicstart;
var btnpreviewmicstop;
var meter;

//functionality varibale
var video;
var stopVideo;
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH = 500;
var HEIGHT = 50;
var rafID = null;
var mediaStreamSource = null;
var selecteddevice_video = null;
var selecteddevice_audio = null;


function includejs(file) {
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    //script.defer = true; 
    console.info(script);
    document.getElementsByTagName('head').item(0).appendChild(script);
}

export default class {

    constructor(url) {
        console.info('Construction call for Kazoophone');
        includejs('SIPml-api_2.1.4.js'); //Load the SIPLM JS API 
        console.info('SIP Stack Loaded');
        window.onload = function () {
            document.getElementById("divforparkunpark").style = "display: none";
        }

    } //end of constructor

    initmediadecie(val_btngetaudioevices,
        val_cmbmediadevicelistvideo,
        val_videoElement,
        val_btngetvideodevices,
        val_cmbmediadevicelistaudio,
        val_startvideopreview,
        val_stopvideopreview,
        val_btnpreviewmicstart,
        val_btnpreviewmicstop,
        val_meter
    ) {

        btngetaudioevices = document.getElementById(val_btngetaudioevices);
        cmbmediadevicelistvideo = document.getElementById(val_cmbmediadevicelistvideo);
        videoElement = document.getElementById(val_videoElement);
        btngetvideodevices = document.getElementById(val_btngetvideodevices);
        cmbmediadevicelistaudio = document.getElementById(val_cmbmediadevicelistaudio);
        startvideopreview = document.getElementById(val_startvideopreview);
        stopvideopreview = document.getElementById(val_stopvideopreview);
        btnpreviewmicstart = document.getElementById(val_btnpreviewmicstart);
        btnpreviewmicstop = document.getElementById(val_btnpreviewmicstop);
        meter = document.getElementById(val_meter);
        console.info("Init device setting");
        getlistofmedia("video"); //Init local video input devices in combo box
        getlistofmedia("audio"); //Init local audio input devices in combo box
    } //End of initmediadecie

    //Main Phone Functions [start]
    // sends SIP REGISTER request to login
    StartStack
        (value_realm,
            value_impi,
            value_impu,
            value_password,
            value_displayname,
            value_wsservice,
            value_iceservice,
            value_txtRegStatus,
            value_txtCallStatus,
            value_btnCallAudio,
            value_btnCallMuteUnmute,
            value_btnHoldResume,
            value_btnHangup,
            value_btnTransfer,
            value_audioRemote,
            value_videolocal,
            value_videoremote,
            value_btnCallVideo,
            value_btnStopVideoSharing,
            value_txtDestinationnumber,
            value_txtTransferCall,
            value_btnaddtoparklist,
            value_callparkcontainer,
            value_divforparkunpark

        ) {
        try {
            onSipEventStack = function (e) {
                switch (e.type) {
                    case 'started':
                        {
                            // catch exception for IE (DOM not ready)
                            try {
                                // LogIn (REGISTER) as soon as the stack finish starting
                                oSipSessionRegister = this.newSession('register', {
                                    expires: 200,
                                    events_listener: { events: '*', listener: onSipEventSession },
                                    sip_caps: [
                                        { name: '+g.oma.sip-im', value: null },
                                        //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                        { name: '+audio', value: null },
                                        { name: 'language', value: '\"en,fr\"' }
                                    ]
                                });
                                oSipSessionRegister.register();
                            }
                            catch (e) {
                                txtRegStatus.value = txtRegStatus.value = "1:" + e + "";
                                btnRegister.disabled = false;
                            }
                            break;
                        }
                    case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
                        {
                            var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                            oSipStack = null;
                            oSipSessionRegister = null;
                            oSipSessionCall = null;

                            // uiOnConnectionEvent(false, false);

                            // stopRingbackTone();
                            // stopRingTone();

                            // uiVideoDisplayShowHide(false);

                            txtCallStatus.value = '';
                            txtRegStatus.value = bFailure ? "Disconnected: " + e.description + "" : "Disconnected";
                            break;
                        }

                    case 'i_new_call':
                        {
                            if (oSipSessionCall) {
                                // do not accept the incoming call if we're already 'in call'
                                e.newSession.hangup(); // comment this line for multi-line support
                            }
                            else {
                                oSipSessionCall = e.newSession;
                                // start listening for events
                                oSipSessionCall.setConfiguration(oConfigCall);

                                uiBtnCallSetText('Answer');
                                btnHangUp.value = 'Reject';
                                btnCall.disabled = false;
                                btnHangUp.disabled = false;

                                startRingTone();

                                var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                                txtCallStatus.value = "Incoming call from [" + sRemoteNumber + "]";
                                showNotifICall(sRemoteNumber);
                            }
                            break;
                        }

                    case 'm_permission_requested':
                        {
                            //divGlassPanel.style.visibility = 'visible';
                            break;
                        }
                    case 'm_permission_accepted':
                    case 'm_permission_refused':
                        {
                            // divGlassPanel.style.visibility = 'hidden';
                            if (e.type == 'm_permission_refused') {
                                //uiCallTerminated('Media stream permission denied');
                            }
                            break;
                        }

                    case 'starting': default: break;
                }
            } //End of onSipEventStack

            onSipEventSession = function (e) {
                switch (e.type) {
                    case 'connecting': case 'connected':
                        {
                            var bConnected = (e.type == 'connected');
                            if (e.session == oSipSessionRegister) {
                                //uiOnConnectionEvent(bConnected, !bConnected);
                                txtRegStatus.value = "" + e.description + "";
                            }
                            else if (e.session == oSipSessionCall) {
                                //  btnHangUp.value = 'HangUp';
                                // btnCall.disabled = true;
                                // btnHangUp.disabled = false;
                                // btnTransfer.disabled = false;
                                if (window.btnBFCP) window.btnBFCP.disabled = false;

                                if (bConnected) {
                                    //stopRingbackTone();
                                    //stopRingTone();

                                    if (oNotifICall) {
                                        oNotifICall.cancel();
                                        oNotifICall = null;
                                    }
                                }
                                txtCallStatus.value = "" + e.description + "";
                            }
                            break;
                        } // 'connecting' | 'connected'
                    case 'terminating': case 'terminated':
                        {
                            if (e.session == oSipSessionRegister) {
                                // uiOnConnectionEvent(false, false);

                                oSipSessionCall = null;
                                oSipSessionRegister = null;

                                txtRegStatus.value = "" + e.description + "";
                                txtCallStatus.value = 'Call Terminated';

                            }
                            else if (e.session == oSipSessionCall) {
                                //uiCallTerminated(e.description);
                            }
                            break;
                        } // 'terminating' | 'terminated'

                    case 'm_stream_video_local_added':
                        {
                            if (e.session == oSipSessionCall) {
                                //uiVideoDisplayEvent(true, true);
                            }
                            break;
                        }
                    case 'm_stream_video_local_removed':
                        {
                            if (e.session == oSipSessionCall) {
                                //uiVideoDisplayEvent(true, false);
                            }
                            break;
                        }
                    case 'm_stream_video_remote_added':
                        {
                            if (e.session == oSipSessionCall) {
                                // uiVideoDisplayEvent(false, true);
                            }
                            break;
                        }
                    case 'm_stream_video_remote_removed':
                        {
                            if (e.session == oSipSessionCall) {
                                //  uiVideoDisplayEvent(false, false);
                            }
                            break;
                        }

                    case 'm_stream_audio_local_added':
                    case 'm_stream_audio_local_removed':
                    case 'm_stream_audio_remote_added':
                    case 'm_stream_audio_remote_removed':
                        {
                            break;
                        }

                    case 'i_ect_new_call':
                        {
                            oSipSessionTransferCall = e.session;
                            break;
                        }

                    case 'i_ao_request':
                        {
                            if (e.session == oSipSessionCall) {
                                var iSipResponseCode = e.getSipResponseCode();
                                if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                                    startRingbackTone();
                                    txtCallStatus.value = 'Remote ringing...';
                                }
                            }
                            break;
                        }

                    case 'm_early_media':
                        {
                            if (e.session == oSipSessionCall) {
                                //stopRingbackTone();
                                // stopRingTone();
                                txtCallStatus.value = 'Early media started';
                            }
                            break;
                        }

                    case 'm_local_hold_ok':
                        {
                            if (e.session == oSipSessionCall) {
                                if (oSipSessionCall.bTransfering) {
                                    oSipSessionCall.bTransfering = false;
                                }
                                btnHoldResume.value = 'Resume';
                                txtCallStatus.value = 'Call placed on park for: ' + txtDestinationnumber.value;
                                oSipSessionCall.bHeld = true;
                            }
                            break;
                        }
                    case 'm_local_hold_nok':
                        {
                            if (e.session == oSipSessionCall) {
                                oSipSessionCall.bTransfering = false;
                                btnHoldResume.value = 'Park Call';
                                //btnHoldResume.disabled = false;
                                txtCallStatus.value = 'Failed to place remote party on park for' + txtDestinationnumber.value;
                            }
                            break;
                        }
                    case 'm_local_resume_ok':
                        {
                            if (e.session == oSipSessionCall) {
                                oSipSessionCall.bTransfering = false;
                                btnHoldResume.value = 'Park Call';
                                //btnHoldResume.disabled = false;
                                txtCallStatus.value = 'Call taken off park for: ' + txtDestinationnumber.value;
                                oSipSessionCall.bHeld = false;
                            }
                            break;
                        }
                    case 'm_local_resume_nok':
                        {
                            if (e.session == oSipSessionCall) {
                                oSipSessionCall.bTransfering = false;
                                //btnHoldResume.disabled = false;
                                txtCallStatus.value = 'Failed to un-parking call for:' + txtDestinationnumber.value;
                            }
                            break;
                        }
                    case 'm_remote_hold':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Placed on call park by remote party';
                            }
                            break;
                        }
                    case 'm_remote_resume':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Taken off call park by remote party';
                            }
                            break;
                        }
                    case 'm_bfcp_info':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'BFCP Info: ' + e.description + '';
                            }
                            break;
                        }

                    case 'o_ect_trying':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Call transfer in progress...';
                            }
                            break;
                        }
                    case 'o_ect_accepted':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Call transfer accepted';
                            }
                            break;
                        }
                    case 'o_ect_completed':
                    case 'i_ect_completed':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Call transfer completed';
                                btnTransfer.disabled = false;
                                if (oSipSessionTransferCall) {
                                    oSipSessionCall = oSipSessionTransferCall;
                                }
                                oSipSessionTransferCall = null;
                            }
                            break;
                        }
                    case 'o_ect_failed':
                    case 'i_ect_failed':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = 'Call transfer failed';
                                btnTransfer.disabled = false;
                            }
                            break;
                        }
                    case 'o_ect_notify':
                    case 'i_ect_notify':
                        {
                            if (e.session == oSipSessionCall) {
                                txtCallStatus.value = "Call Transfer: " + e.getSipResponseCode() + " " + e.description + "";
                                if (e.getSipResponseCode() >= 300) {
                                    if (oSipSessionCall.bHeld) {
                                        oSipSessionCall.resume();
                                    }
                                    btnTransfer.disabled = false;
                                }
                            }
                            break;
                        }
                    case 'i_ect_requested':
                        {
                            if (e.session == oSipSessionCall) {
                                var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
                                if (confirm(s_message)) {
                                    txtCallStatus.value = "Call transfer in progress...";
                                    oSipSessionCall.acceptTransfer();
                                    break;
                                }
                                oSipSessionCall.rejectTransfer();
                            }
                            break;
                        }
                } //End of switch
            } //End of onSipEventSession
            this.value_realm = value_realm;
            this.value_impi = value_impi;
            this.value_impu = value_impu;
            this.value_password = value_password;
            this.value_displayname = value_displayname;
            this.value_wsservice = value_wsservice;
            this.value_iceservice = value_iceservice;

            // create SIP stack
            oSipStack = new SIPml.Stack({
                realm: this.value_realm,
                impi: this.value_impi,
                impu: this.value_impu,
                password: this.value_password,
                display_name: this.value_displayname,
                websocket_proxy_url: this.value_wsservice,
                ice_servers: this.value_iceservice,
                events_listener: { events: '*', listener: onSipEventStack },
                sip_headers: [
                    { name: 'User-Agent', value: 'IM-client/OMA1.0 2600Hz_Softpone_Agent' },
                    { name: 'Organization', value: '2600Hz SDK' }
                ]
            }
            );

            txtRegStatus = document.getElementById(value_txtRegStatus);
            txtCallStatus = document.getElementById(value_txtCallStatus);
            btnCallAudio = document.getElementById(value_btnCallAudio);
            btnCallMuteUnmute = document.getElementById(value_btnCallMuteUnmute);
            btnHoldResume = document.getElementById(value_btnHoldResume);
            btnHangup = document.getElementById(value_btnHangup);
            btnTransfer = document.getElementById(value_btnTransfer);
            audioRemote = document.getElementById(value_audioRemote);
            viewVideoLocal = document.getElementById(value_videolocal);
            viewVideoRemote = document.getElementById(value_videoremote);
            btnCallVideo = document.getElementById(value_btnCallVideo);
            btnStopVideoSharing = document.getElementById(value_btnStopVideoSharing);
            txtDestinationnumber = document.getElementById(value_txtDestinationnumber);
            txtTransferCall = document.getElementById(value_txtTransferCall);
            btnaddtoparklist = document.getElementById(value_btnaddtoparklist);
            callparkcontainer = document.getElementById(value_callparkcontainer);
            divforparkunpark = document.getElementById(value_divforparkunpark);





            //divforparkunpark.style.display="none";
            btnaddtoparklist.value = "Call to Park List";





            registerSession = oSipStack.newSession('register', {
                events_listener: { events: '*', listener: onSipEventStack } // optional: '*' means all events
            });
            registerSession.register();
            console.info('Registered Process passed');

            oConfigCall = {
                audio_remote: audioRemote,
                video_local: viewVideoLocal,
                video_remote: viewVideoRemote,
                bandwidth: { audio: undefined, video: undefined },
                events_listener: { events: '*', listener: onSipEventSession },
                sip_caps: [
                    { name: '+g.oma.sip-im' },
                    { name: 'language', value: '\"en,fr\"' }
                ]
            };


            if (oSipStack.start() != 0) {
                txtRegStatus = "Failed to start the SIP stack";
            }
        }
        catch (e) {
            txtRegStatus = "2:" + e + "";
            console.info("Error: " + e);
        }
    } //End of StartStack

    sipUnRegister() {
        if (oSipStack) {
            oSipStack.stop(); // shutdown all sessions
        }
    }//End of sipUnRegister

    sipCall(s_type) {
        // create call session
        oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
        // make call
        if (oSipSessionCall.call(txtDestinationnumber.value) != 0) {
            oSipSessionCall = null;
            txtCallStatus.value = 'Failed to make call';
            btnCall.disabled = false;
            btnHangUp.disabled = true;
            return;
        }
        else if (oSipSessionCall) {
            txtCallStatus.value = 'Connecting...';
            oSipSessionCall.accept(oConfigCall);
        }
    } //End of sipCall

    sipToggleHoldResume() {
        if (oSipSessionCall) {
            var i_ret;
            txtCallStatus.value = oSipSessionCall.bHeld ? 'Un-parking the call for: ' + txtDestinationnumber.value : 'Parking the call for: ' + txtDestinationnumber.value;
            i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();
            if (i_ret != 0) {
                txtCallStatus.value = 'Call Park / Un-Park failed for: ' + txtDestinationnumber.value;
                return;
            }
        }
    }//End of sipToggleHoldResume

    stopShareVideoToggle() {
        var i_ret;
        var bMute = !oSipSessionCall.bMute;
        txtCallStatus.value = bMute ? 'Stop Video' : 'Resume Video';
        i_ret = oSipSessionCall.mute('video', bMute);
        if (i_ret != 0) {
            txtCallStatus.value = 'Stop / Resume Video failed';
            return;
        }
        oSipSessionCall.bMute = bMute;
        btnStopVideoSharing.value = bMute ? "Resume Video" : "Stop video";
    } //End of MuteUnMuteCallVideo

    sipToggleMute() {
        if (oSipSessionCall) {
            var i_ret;
            var bMute = !oSipSessionCall.bMute;
            txtCallStatus.value = bMute ? 'Mute the call...' : 'Unmute the call...';
            i_ret = oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);
            if (i_ret != 0) {
                txtCallStatus.value = 'Mute / Unmute failed';
                return;
            }
            oSipSessionCall.bMute = bMute;
            btnCallMuteUnmute.value = bMute ? "Unmute" : "Mute";
        }
    }//End of sipToggleMute


    callTransfer(destination) {
        if (oSipSessionCall) {
            var s_destination = destination;

            if (!tsk_string_is_null_or_empty(s_destination)) {
                if (oSipSessionCall.transfer(s_destination) != 0) {
                    console.info('Call transfer failed');
                    return;
                }
                console.info('Transfering the call to...' + destination);

            }
        }
    }// End of CallTransfer

    sipHangUp() {
        if (oSipSessionCall) {
            txtCallStatus.value = 'Terminating the call...';
            oSipSessionCall.hangup({ events_listener: { events: '*', listener: onSipEventSession } });
            txtCallStatus.value = 'Call hanged up';

            callparkcontainer.innerHTML = "";



        }
    }//End of terminates

    sipSendDTMF(c) {
        if (oSipSessionCall && c) {
            if (oSipSessionCall.dtmf(c) == 0) {
                try {
                    dtmfTone.play();
                    console.info('DTMF Event -> You pressed :' + c);
                } catch (e) { console.info('Error from DTMF: ' + e)}
            }

        }
        else if(c) {
            try {
                txtDestinationnumber.value = txtDestinationnumber.value + c;
                dtmfTone.play();

            } catch (e) { console.info('Error from DTMF: ' + e)}
        }
        else
        {
           console.info("Nothing from DTMF") 
        }
    }//End of sipSendDTMF


    addparklist() {
        btnHoldResume.value = 'Park/Unpark: ' + txtDestinationnumber.value;
        var element = btnHoldResume;
        var clone = element.cloneNode(true);
        callparkcontainer.appendChild(clone);
    } //End of addparklist


    startRingTone() {
        try { ringtone.play(); }
        catch (e) { }
    }//End og startRingTone

    stopRingTone() {
        try { ringtone.pause(); }
        catch (e) { }
    } //End of stopRingTone

    startRingbackTone() {
        try { ringbacktone.play(); }
        catch (e) { }
    } //End of startRingbackTone

    stopRingbackTone() {
        try { ringbacktone.pause(); }
        catch (e) { }
    }//end ofstopRingbackTone 


    //Experimental fucntion not published yet
    showNotifICall(s_number) {
        // permission already asked when we registered
        if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
            if (oNotifICall) {
                oNotifICall.cancel();
            }
            oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);
            oNotifICall.onclose = function () { oNotifICall = null; };
            oNotifICall.show();
        }
    } //End of showNotifICall

    uiCallTerminated(s_description) {
        if (window.btnBFCP) window.btnBFCP.disabled = true;
        oSipSessionCall = null;
        // stopRingbackTone();
        //stopRingTone();
        txtCallStatus.value = "" + s_description + "";

        if (oNotifICall) {
            oNotifICall.cancel();
            oNotifICall = null;
        } setTimeout(function () { if (!oSipSessionCall) txtCallStatus.value = ''; }, 2500);
    } //End of uiCallTerminated

    //Main Phone Functions [End]


    //Function for localmedia device and Mic Meter[start]
    previewlocalvideo() {
        var val = cmbmediadevicelistvideo.value;
        var getselectedID = val.split('=');
        var DID = getselectedID[1].replace(/\s/g, "");
        console.info("Selected video device ID = " + DID);
        video = videoElement
        stopVideo = stopvideopreview;
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(
                {
                    video: true,
                    video: {
                        deviceId: {
                            exact: DID
                        }
                    }
                }
            )
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!" + err0r);
                });
        }
    }//End of previewlocalvideo


    stoplocalvideo() {
        var stream = video.srcObject;
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }
        video.srcObject = null;
    } //End of stoplocalvideo




    checkmic() {
        // grab the "meter" canvas
        canvasContext = meter.getContext("2d");

        // monkeypatch Web Audio
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        // grab an audio context
        audioContext = new AudioContext();

        // Attempt to get audio input
        try {
            // monkeypatch getUserMedia
            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

            // ask for an audio input
            console.info("Asking Mic Permisison")
            navigator.getUserMedia(
                {
                    "audio": {
                        "mandatory": {
                            "googEchoCancellation": "false",
                            "googAutoGainControl": "false",
                            "googNoiseSuppression": "false",
                            "googHighpassFilter": "false"
                        },
                        "optional": []
                    },
                }, gotStream, didntGetStream);
        } catch (e) {
            alert('getUserMedia threw exception :' + e);
        }
    }//End of checkmic

    //Expermintal function not published yet
    /*
    stoplocalaudio() {
        mediaStreamSource.disconnect(meter);
        mediaStreamSource.srcObject = null;
        //
        meter = null;
        console.info("Mic stopped");

    }//stoplocalaudio
    */
} //end of default class



function didntGetStream() {
    console.info('Stream generation failed.');
} //End of didntGetStream


function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);
    // kick off the visual updating
    drawLoop();
} //End of gotStream

function drawLoop(time) {
    // clear the background
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

    // set up the next visual callback
    rafID = window.requestAnimationFrame(drawLoop);
} //End of drawLoop


 //Expermintal function not published yet
    /*
function stoplocalaudio() {
    mediaStreamSource.disconnect(meter);
    mediaStreamSource.srcObject = null;
    console.info("Mic stopped");
}//End of stoplocalaudio
*/


//code for volume meter
function getlistofmedia(type) {
    if (type.match("audio")) {
        console.info("Device Type Selected " + type);
        // var selectaudio = document.getElementById("cmbmediadevicelistaudio");	
        var selectaudio = cmbmediadevicelistaudio;

        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
            return;
        }
        // List cameras and microphones.
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {
                    console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                    var device = device.kind + ": " + device.label + " id = " + device.deviceId;

                    if (device.match("audioinput")) {

                        selectaudio.options[selectaudio.options.length] = new Option(device, device);
                        // cmbmediadevicelistaudio.options[selectaudio.options.length] = new Option(device, device);


                    }
                });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
    } //End if
    else if (type.match("video")) {
        console.info("Device Type Selected " + type);

        var selectvideo = cmbmediadevicelistvideo;
        //var selectvideo = document.getElementById("cmbmediadevicelistvideo");	


        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
            return;
        }
        // List cameras and microphones.
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {

                    console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                    var device = device.kind + ": " + device.label + " id = " + device.deviceId;

                    if (device.match("videoinput")) {
                        selectvideo.options[selectvideo.options.length] = new Option(device, device);
                    }

                });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });

    } //End if

} //End of getlistofmedia


function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    var processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping =
        function () {
            if (!this.clipping)
                return false;
            if ((this.lastClip + this.clipLag) < window.performance.now())
                this.clipping = false;
            return this.clipping;
        };

    processor.shutdown =
        function () {
            this.disconnect();
            this.onaudioprocess = null;
        };

    return processor;
} //End of createAudioMeter

function volumeAudioProcess(event) {
    var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
    var sum = 0;
    var x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (var i = 0; i < bufLength; i++) {
        x = buf[i];
        if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
        }
        sum += x * x;
    }
    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging);
} //End of volumeAudioProcess



