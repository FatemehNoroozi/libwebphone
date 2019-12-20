# libwebphone.js library v2.2

The goal of this library is to turn the browser in a softphone based on SIP+WebRTC

1. [Initialization of the Library](#initialization-of-the-library)
2. [Methods](#methods)
3. [Contact](#contact)

## Initialization of the Library

First of all you need to include the JavaScript in the browser. In order to do so, you need to add the following snippet in your HTML.

<script type="text/javascript">
  var phone = new libwebphone();    
</script> 

Next need to set the parameter to start connect kazoo platform in below function "StartStack"

<script type="text/javascript">


      function login()
      {
        
        phone.StartStack
            (
            "vbbZ65Q.sb.2600hz.com",
             [impi],
             [impu],
             [password],
             [displayname],
             "wss://sandbox.2600hz.com:5065/",
             "[{url:'stun:stun.l.google.com:19302'}]",
             "[html read only input field elementid for connection status]",
             "[html read only input field elementid for call status]", 
             "[html button elementid for audio call]",
             "[html button elementid for audio call mute/unmute]", 
             "[html button elementid for audio call park/unpark]", 
             "[html button elementid for call hang-up]", 
             "[html button elementid for call transfer]",
             "[html audio elementid for remote party media]", 
             "[html video elementid for local  media]", 
             "[html audio elementid for remote party video media]", 
             "[html button elementid for video call]",
             "[html button elementid for video stop/resmue]", 
             "[html editable input field elementid for destination number to dial]", 
             "[html editable input field elementid for call transfer]",
             "[html button elementid to add call to call park container]",
             "[html div elementid that required to for call park container]",
             "[html div elementid that required to handle multiple call park ]"             
            );
            
      }
</script> 

[Methods](#methods)
The phone object has below accessible methods:

StartStack() :: Connect to Kazoo platform with credential and other paramaters
phone.sipUnRegister()() :: Logout and disconnect from kazoo platform
phone.sipCall(call-audio/call-audiovideo) :: Audio / Video call generation
phone.sipToggleMute() :: Mute / UnMute audio call
phone.sipToggleHoldResume() :: Park / Unpark audio call
phone.callTransfer([Number to transfer]) :: Call transfer
phone.stopShareVideoToggle() :: Stop / Sahring video local video stream 
phone.sipHangUp() :: Hang up ongoing call
phone.sipSendDTMF([value]) :: Send DTMF value from dialpad


Using this, you should now be able to create some cool applications using softphones in your browser!

## Contact
If you have any question or remark about the library or its documentation, feel free to come talk to us on IRC #2600hz on FreeNode.
