
/*
import lwpTransport from './lwpTransport';
import lwpMediaDevices from './lwpMediaDevices';
import lwpDialpad from './lwpDialpad';

export default class {
    constructor(config = {}, i18n = null) {
        this._transportPromise = new lwpTransport(this, config, i18n);
        this._mediaDevicesPromise = new lwpMediaDevices(this, config, i18n);
        this._dialpadPromise = new lwpDialpad(this, config, i18n);

        // TODO: manage the registration, re-register when connection is lost
        //  and gained back, handle change creds, accept a lwpKazooDevice object
        //this._registrarPromise = new lwpRegistrar(this, config, i18n);

        // TODO: connect to Kazoo websockets and manage a list of parked calls
        //this._parkedCallsPromise = new lwpParkedCalls(this, config, i18n);

        // TODO: connect to Kazoo API and render a list of the users devices,
        //  when selected update lwpRegistrar to use those creds
        //this._kazooDevicePromise = new lwpKazooDevice(this, config, i18n);
    }

    getTransport() {
        return this._transportPromise;
    }

    getMediaDevices() {
        return this._mediaDevicesPromise;
    }

    getDialpad() {
        return this._dialpadPromise;
    }




}
*/


//import {}  from "./SIPml-api_2.1.4";
//import * as SIPml  from "./SIPml-api_2.1.4"

//Last modified: 08/Dec/2019


let phone;

var sipStack;
var eventsListener;
var onSipEventStack;
var oConfigCall;
var oSipSessionRegister, onSipEventSession;
var login;
var callSession;
var makeCall;
var oConfigCall;
var videoRemote, videoLocal, audioRemote;
var viewVideoLocal, viewVideoRemote;
var i_hold;


export default class {
    constructor(url) {
        console.info('Construction call for Kazoophone');
        includejs('SIPml-api_2.1.4.js'); //Load the SIPLM JS API 
        console.info('SIP Stack Started');
    }

    StartAgenStack(UserName, UserNumber, SIPURI, Password, Realm, WSService, StunService, Outbundproxy) {
        this.UserName = UserName;
        this.UserNumber = UserNumber;
        this.SIPURI = SIPURI;
        this.Password = Password;
        this.Realm = Realm;
        this.WSService = WSService;
        this.StunService = StunService;
        this.Outbundproxy = Outbundproxy;

        
        eventsListener = function (e) {
            if (e.type == 'started') {

            }
            else if (e.type == 'i_new_message') { // incoming new SIP MESSAGE (SMS-like)
                // acceptMessage(e);
            }
            else if (e.type == 'i_new_call') { // incoming audio/video call
                //acceptCall(e);
            }
        }
        



        



        onSipEventStack = function (e) {
            console.info("Session Status :" + e.type)

            switch (e.type) {
                case 'started':
                    {
                        // catch exception for IE (DOM not ready)
                        try {
                            // LogIn (REGISTER) as soon as the stack finish starting
                            oSipSessionRegister = this.newSession('register', {
                                expires: 200,
                                //audio_remote: audioRemote,
                                //video_local: videoLocal,
                                //video_remote: videoRemote,
                                //bandwidth: { audio: undefined, video: undefined },
                                events_listener: { events: '*', listener: onSipEventStack },                                
                                sip_caps: [
                                    { name: '+g.oma.sip-im', value: null },
                                    { name: '+audio', value: null },
                                    { name: 'language', value: '\"en,fr\"' }
                                ]
                            });                        
                            

                            oSipSessionRegister.register();
                            console.info('Kazoo SIP Agent stack started');
                            console.info("Session Status :" + e.type)

                             videoLocal = document.getElementById("video_local");
                             videoRemote = document.getElementById("video_remote");
                             audioRemote = document.getElementById("audio_remote");


                            var bSuccess = (e.type == 'started');
                            document.getElementById('txtRegStatus').value = '';
                            //document.getElementById('txtRegStatus').value = bSuccess ? "Connected" + e.description + "  " : " Connected";

                            document.getElementById('txtRegStatus').value = "Connected and Logged-in";


                            document.getElementById('btnConnect').disabled = true;
                            document.getElementById('btnDisconnect').disabled = false;
                            //document.getElementById('txtRegStatus').value = "Connection Status: " + //e.type;
                            break;
                        }
                        catch (e) {
                            document.getElementById('txtRegStatus').value = '';
                            document.getElementById('txtRegStatus').value = "Error Connection Status: " + e.description;
                            document.getElementById('btnConnect').disabled = false;
                            document.getElementById('btnDisconnect').disabled = false;
                        }
                        break;
                    }
                case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
                    {
                        sipStack = null;
                        oSipSessionRegister = null;
                        callSession = null;
                        var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                        document.getElementById('txtRegStatus').value = '';

                        document.getElementById('txtRegStatus').value = bFailure ? "Logged-out and disconnected" + e.description + " " : "Logged-out and disconnected";
                        document.getElementById('btnConnect').disabled = false;
                        document.getElementById('btnDisconnect').disabled = true;
                        break;
                    }

                case 'i_new_call':
                    {
                        if (callSession) {
                            // do not accept the incoming call if we're already 'in call'
                            e.newSession.hangup(); // comment this line for multi-line support
                        }
                        else {
                            callSession = e.newSession;
                            callSession.setConfiguration(oConfigCall);

                            uiBtnCallSetText('Answer');
                            btnHangUp.value = 'Reject';
                            btnCall.disabled = false;
                            btnHangUp.disabled = false;

                            startRingTone();

                            var sRemoteNumber = (callSession.getRemoteFriendlyName() || 'unknown');
                            txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
                            showNotifICall(sRemoteNumber);
                        }
                        break;
                    }

                case 'm_permission_requested':
                    {
                        break;
                    }
                case 'm_permission_accepted':
                case 'm_permission_refused':
                    {
                        if (e.type == 'm_permission_refused') {
                        }
                        break;
                    }

                case 'starting': default: break;
            } //End case
        } //End of onSipEventStack

        onSipEventSession = function (e) {
            switch (e.type) {
                case 'connecting': case 'connected':
                    {
                        var bConnected = (e.type == 'connected');
                        if (e.session == oSipSessionRegister) {
                            uiOnConnectionEvent(bConnected, !bConnected);
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = e.description;

                        }
                        else if (e.session == callSession) {
                            if (window.btnBFCP) window.btnBFCP.disabled = false;
                            if (bConnected) {

                                if (oNotifICall) {
                                    oNotifICall.cancel();
                                    oNotifICall = null;
                                }
                            }

                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = e.description;

                            if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                                uiVideoDisplayEvent(false, true);
                                uiVideoDisplayEvent(true, true);
                            }
                        }
                        break;
                    } // 'connecting' | 'connected' 
                case 'terminating': case 'terminated':
                    {
                        if (e.session == oSipSessionRegister) {
                            uiOnConnectionEvent(false, false);

                            callSession = null;
                            oSipSessionRegister

                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = e.description;

                        }
                        else if (e.session == callSession) {
                        }
                        break;
                    } // 'terminating' | 'terminated'

                case 'm_stream_video_local_added':
                    {
                        if (e.session == callSession) {
                            uiVideoDisplayEvent(true, true);
                        }
                        break;
                    }
                case 'm_stream_video_local_removed':
                    {
                        if (e.session == callSession) {
                            uiVideoDisplayEvent(true, false);
                        }
                        break;
                    }
                case 'm_stream_video_remote_added':
                    {
                        if (e.session == callSession) {
                            uiVideoDisplayEvent(false, true);
                        }
                        break;
                    }
                case 'm_stream_video_remote_removed':
                    {
                        if (e.session == callSession) {
                            uiVideoDisplayEvent(false, false);
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
                        if (e.session == callSession) {
                            var iSipResponseCode = e.getSipResponseCode();
                            if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                                document.getElementById('txtCallStatus').value = '';
                                document.getElementById('txtCallStatus').value = 'Remote party ringing...'
                            }
                        }
                        break;
                    }

                case 'm_early_media':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Early media started';
                        }
                        break;
                    }

                case 'm_local_hold_ok':
                    {
                        if (e.session == callSession) {
                            if (callSession.bTransfering) {
                                callSession.bTransfering = false;
                            }
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call placed on hold';
                        }
                        break;
                    }
                case 'm_local_hold_nok':
                    {
                        if (e.session == callSession) {
                            callSession.bTransfering = false;
                            btnHoldResume.value = 'Hold';
                            btnHoldResume.disabled = false;
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Failed to place remote party on hold';

                        }
                        break;
                    }
                case 'm_local_resume_ok':
                    {
                        if (e.session == callSession) {
                            callSession.bTransfering = false;
                            btnHoldResume.value = 'Hold';
                            btnHoldResume.disabled = false;
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call taken off hold';
                            callSession.bHeld = false;
                            if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                                uiVideoDisplayEvent(false, true);
                                uiVideoDisplayEvent(true, true);
                            }
                        }
                        break;
                    }
                case 'm_local_resume_nok':
                    {
                        if (e.session == callSession) {
                            callSession.bTransfering = false;
                            btnHoldResume.disabled = false;
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Failed to unhold call';
                        }
                        break;
                    }
                case 'm_remote_hold':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Placed on hold by remote party';
                        }
                        break;
                    }
                case 'm_remote_resume':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Taken off hold by remote party';
                        }
                        break;
                    }
                case 'm_bfcp_info':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'BFCP Info: ' + e.description;
                        }
                        break;
                    }

                case 'o_ect_trying':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call transfer in progress...';

                        }
                        break;
                    }
                case 'o_ect_accepted':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call transfer accepted';
                        }
                        break;
                    }
                case 'o_ect_completed':
                case 'i_ect_completed':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call transfer completed';
                            if (oSipSessionTransferCall) {
                                callSession = oSipSessionTransferCall;
                            }
                            oSipSessionTransferCall = null;
                        }
                        break;
                    }
                case 'o_ect_failed':
                case 'i_ect_failed':
                    {
                        if (e.session == callSession) {
                            document.getElementById('txtCallStatus').value = '';
                            document.getElementById('txtCallStatus').value = 'Call transfer failed';


                            btnTransfer.disabled = false;
                        }
                        break;
                    }
                case 'o_ect_notify':
                case 'i_ect_notify':
                    {
                        if (e.session == callSession) {
                            // txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
                            if (e.getSipResponseCode() >= 300) {
                                if (callSession.bHeld) {
                                    callSession.resume();
                                }
                                btnTransfer.disabled = false;
                            }
                        }
                        break;
                    }
                case 'i_ect_requested':
                    {
                        if (e.session == callSession) {
                            if (confirm(s_message)) {
                                document.getElementById('txtCallStatus').value = '';
                                document.getElementById('txtCallStatus').value = 'Call transfer in progress...';


                                callSession.acceptTransfer();
                                break;
                            }
                            callSession.rejectTransfer();
                        }
                        break;
                    }
            }
        } //End of onSipEventSession


        sipStack = new SIPml.Stack({
            realm: this.Realm,
            impi: this.UserNumber,
            impu: this.SIPURI,
            password: this.Password,
            display_name: this.UserName,
            websocket_proxy_url: this.WSService,
            // outbound_proxy_url: this.Outbundproxy, //optional param
            enable_rtcweb_breaker: true,
            events_listener: { events: '*', listener: onSipEventStack },
            enable_click2call: true,
            sip_headers: [ // optional
                { name: 'User-Agent', value: 'IM-client/OMA1.0 kazoophoneagent-v0.1' },
                { name: 'Organization', value: '2600Hz Telecom' },
            ]
        }
        );

        if (sipStack.start() != 0) {
            console.info('Failed to start tKazoo SIP Agent');
        }
    }//End of StartAgenStack

    
    CallAudioOnly(destination) {
      callSession = sipStack.newSession('call-audiovideo', {
            audio_remote: document.getElementById('audio-remote'),
            events_listener: { events: '*', listener: onSipEventSession }
        });
        if (callSession.call(destination) != 0) {
            callSession = null;
            return;
        }
        else if (callSession) {
            callSession.accept(oConfigCall);
        }
    } //End of CallAudioOnly





    CallAudioVideoBoth(destination) {
        callSession = sipStack.newSession('call-audiovideo', {
            video_local: document.getElementById('video-local'),
            video_remote: document.getElementById('video-remote'),
            audio_remote: document.getElementById('audio-remote'),
            events_listener: { events: '*', listener: onSipEventSession } // optional: '*' means all events	

        });
        //document.getElementById('video-local') = video_local;
        //document.getElementById('video-remote') = video-remote;
        console.info('Establishing call...');
        callSession.call(destination);

    } //End of CallAudioVideoBoth


    MuteUnMuteCallAudio() {
        if (callSession) {
            var i_ret;
            var bMute = !callSession.bMute;
            i_ret = callSession.mute('audio', bMute);
            if (i_ret != 0) {
                //txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
                return;
            }
            callSession.bMute = bMute;
            btnCallMuteUnmute.value = bMute ? "Unmute" : "Mute";
        }
    } //MuteUnMuteCallAudio

    MuteUnMuteCallVideo() {
        if (callSession) {
            var i_ret;
            var bMute = !callSession.bMute;
            i_ret = callSession.mute('video', bMute);
            if (i_ret != 0) {
                //txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
                return;
            }
            callSession.bMute = bMute;
            btnStopVideoSharing.value = bMute ? "Resume Video Sharing" : "Stop Video Sharing";
        }
    } //MuteUnMuteCallVideo


    HoldResumCall() {

    }//HoldResumCall


    CallTransfer(destination) {
        if (callSession) {
            var s_destination = destination;

            if (!tsk_string_is_null_or_empty(s_destination)) {
                if (callSession.transfer(s_destination) != 0) {
                    console.info('Call transfer failed');
                    return;
                }
                console.info('Transfering the call to...' + destination);
            }
        }
    }// End of CallTransfer

    sipSendDTMF(c) {
        if (callSession && c) {

            if (callSession.dtmf(c) == 0) {
                try { dtmfTone.play(); } catch (e) { }
                var keyvalue = document.getElementById("txtDestinationnumber").value;
                document.getElementById("txtDestinationnumber").value = keyvalue + c;
            }
        }
        else {
            var keyvalue = document.getElementById("txtDestinationnumber").value;
            document.getElementById("txtDestinationnumber").value = keyvalue + c;
            dtmfTone.play();
        }

    }//SendDTMF

    HangUpCall() {
        if (callSession) {
            console.info('Hanging Up the ongoing call');
            callSession.hangup({ events_listener: { events: '*', listener: onSipEventSession } });
            document.getElementById("txtCallStatus").value = "Call Hanged-up successfully";
        }
        else {
            document.getElementById("txtCallStatus").value = "No call session  found to terminate";
        }

    }//End of HangUp


    Disconnect() {
        if (sipStack) {
            sipStack.stop(); // shutdown all sessions
            console.info('Disconnected Agent and close all sessions');


        }
    }//End of Disconnect
}

function showNotifICall(s_number) {
    // permission already asked when we registered
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
        if (oNotifICall) {
            oNotifICall.cancel();
        }
        oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);
        oNotifICall.onclose = function () { oNotifICall = null; };
        oNotifICall.show();
    }
}

function uiCallTerminated(s_description) {
    //uiBtnCallSetText("Call");
    //btnHangUp.value = 'HangUp';
    //btnHoldResume.value = 'hold';
    //btnMute.value = "Mute";
    //btnCall.disabled = false;
    //btnHangUp.disabled = true;
    if (window.btnBFCP) window.btnBFCP.disabled = true;

    callSession = null;

    //stopRingbackTone();
    //stopRingTone();

    //txtCallStatus.innerHTML = "<i>" + s_description + "</i>";
    document.getElementById("txtCallStatus").value = s_description;
    uiVideoDisplayShowHide(false);
    //divCallOptions.style.opacity = 0;

    if (oNotifICall) {
        oNotifICall.cancel();
        oNotifICall = null;
    }

    //uiVideoDisplayEvent(false, false);
    //uiVideoDisplayEvent(true, false);

    setTimeout(function () { if (!callSession) document.getElementById("txtCallStatus").value =  ''; }, 2500);
}

function uiVideoDisplayEvent(b_local, b_added) {
    var o_elt_video = b_local ? videoLocal : videoRemote;

    if (b_added) {
       // o_elt_video.style.opacity = 1;
        uiVideoDisplayShowHide(true);
    }
    else {
       // o_elt_video.style.opacity = 0;
       // fullScreen(false);
    }
}

function uiVideoDisplayShowHide(b_show) {
    if (b_show) {
       // tdVideo.style.height = '340px';
       // divVideo.style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';
    }
    else {
       // tdVideo.style.height = '0px';
       // divVideo.style.height = '0px';
    }
   // btnFullScreen.disabled = !b_show;
}


function includejs(file) {
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    //script.defer = true; 
    console.info(script);
    document.getElementsByTagName('head').item(0).appendChild(script);
}
