const remoteConnection = new RTCPeerConnection();

const sendChannel = remoteConnection.createDataChannel("myDataChannel");
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

remoteConnection.onicecandidate = (event) => {
    if (event.candidate) {
        let candidateJson = JSON.stringify(event.candidate);
        console.log('[Sender] onicecandidate', candidateJson);
        document.getElementById('candidateSender').innerHTML = candidateJson
    }
};

remoteConnection.createOffer()
.then( offerSdp => {
    remoteConnection.setLocalDescription(offerSdp);
    let offerJson = JSON.stringify(offerSdp)
    console.log('[Sender] Share this offer to receiver: ', offerJson);
    document.getElementById('offerSdp').innerHTML = offerJson;
});

document.getElementById('inputAnswer').onclick = event => {
    const offer = prompt("Input answer from receiver");
    remoteConnection.setRemoteDescription(JSON.parse(offer));
};

document.getElementById('inputCandidateReceiver').onclick = event => {
    const candidate = prompt('Receiver Candidate を入力');
    remoteConnection.addIceCandidate(JSON.parse(candidate)).then((event) => {
        console.log("[Sender] candidate added: ", event);
    });
}
