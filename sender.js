const senderConn = new RTCPeerConnection();
let offerJson = "";
let candidateSender = ""

const sendChannel = senderConn.createDataChannel("myDataChannel");
sendChannel.onopen = event => {
    console.log('[Sender] onopen: ', event);
    const sendButton = document.getElementById("sendButton");
    sendButton.onclick = () => {
        const sendText = document.getElementById("sendText");
        const data = sendText.value;
        sendChannel.send(data);
        sendText.value = "";
    };
};
sendChannel.onclose = event => {
    console.log('[Sender] onclose: ', close);

    const sendButton = document.getElementById("sendButton");
    sendButton.onclick = null
}
sendChannel.onmessage = msg => {
    console.log('[Sender] onmessage: ', msg);
}

senderConn.onicecandidate = (event) => {
    if (event.candidate) {
        candidateSender = JSON.stringify(event.candidate);
        console.log('[Sender] onicecandidate', candidateSender);
        document.getElementById('candidateSender').innerHTML = candidateSender
    }
};

senderConn.createOffer()
.then( offerSdp => {
    senderConn.setLocalDescription(offerSdp);
    offerJson = JSON.stringify(offerSdp)
    console.log('[Sender] Share this offer to receiver: ', offerJson);
    document.getElementById('offerSdp').innerHTML = offerJson;
});

function onAnswerSdp(sdp) {
    console.log('[Sender] onAnswerSdp ', sdp);
    senderConn.setRemoteDescription(sdp);
}

function onReceiverCandidate(candidate) {
    senderConn.addIceCandidate(candidate).then((event) => {
        console.log("[Sender] candidate added: ", candidate);
    });
}

document.getElementById('inputAnswer').onclick = event => {
    const answer = prompt("Input answer from receiver");
    onAnswerSdp(JSON.parse(answer));
};

document.getElementById('inputCandidateReceiver').onclick = event => {
    const candidate = prompt('Input receiver candidate');
    onReceiverCandidate(JSON.parse(candidate));
}

document.getElementById('testSignalingSender').onclick = event => {
    let origin = prompt('Input `address:port` to signaling server');
    let wsSender = new WebSocket(`ws://${origin}/offer`);
    let msg = {
        "token": "sampleToken",
        "sdp": offerJson,
        "candidate": candidateSender
    };
    wsSender.onopen = async () => {
        console.log('[Sender] send offer', msg);
        wsSender.send(JSON.stringify(msg));
    }
    wsSender.onmessage = msg => {
        console.log("[Sender] onmessage", msg.data);
        let json = JSON.parse(msg.data);
        let sdp = JSON.parse(json.sdp);
        let candidate = JSON.parse(json.candidate);
        onAnswerSdp(sdp);
        onReceiverCandidate(candidate);
    }
}
