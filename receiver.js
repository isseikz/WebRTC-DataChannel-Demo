const receiverConn = new RTCPeerConnection();

receiverConn.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
        console.log('[Receiver] onmessage: ', event.data)
        const receiveText = document.getElementById("receiveText");
        receiveText.innerHTML += `${event.data}\n`;
        
    };
};

receiverConn.onicecandidate = (event) => {
    if (event.candidate) {
        let candidateJson = JSON.stringify(event.candidate);
        console.log('[Receiver] onicecandidate', candidateJson);
        document.getElementById('candidateReceiver').innerHTML = candidateJson;
    }
};

document.getElementById('inputOffer').onclick = event => {
    const offer = prompt("Input offer");
    receiverConn.setRemoteDescription(JSON.parse(offer)).then(() => {
        return receiverConn.createAnswer();
    }).then((answer) => {
        let answerJson = JSON.stringify(answer);
        console.log('[Receiver] Input this answer on Sender: ', answerJson);
        document.getElementById('answerSdp').innerHTML = answerJson;
        return receiverConn.setLocalDescription(answer);
    });
};

document.getElementById('inputCandidateSender').onclick = event => {
    const candidate = prompt('Input sender candidate');
    receiverConn.addIceCandidate(JSON.parse(candidate)).then((event) => {
        console.log("[Receiver] candidate added: ", event);
    });
}
