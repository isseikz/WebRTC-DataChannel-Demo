const senderConn = new RTCPeerConnection();

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
        let candidateJson = JSON.stringify(event.candidate);
        console.log('[Sender] onicecandidate', candidateJson);
        document.getElementById('candidateSender').innerHTML = candidateJson
    }
};

senderConn.createOffer()
.then( offerSdp => {
    senderConn.setLocalDescription(offerSdp);
    let offerJson = JSON.stringify(offerSdp)
    console.log('[Sender] Share this offer to receiver: ', offerJson);
    document.getElementById('offerSdp').innerHTML = offerJson;
});

document.getElementById('inputAnswer').onclick = event => {
    const offer = prompt("Input answer from receiver");
    senderConn.setRemoteDescription(JSON.parse(offer));
};

document.getElementById('inputCandidateReceiver').onclick = event => {
    const candidate = prompt('Receiver Candidate を入力');
    senderConn.addIceCandidate(JSON.parse(candidate)).then((event) => {
        console.log("[Sender] candidate added: ", event);
    });
}
