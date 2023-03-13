const receiverConn = new RTCPeerConnection();
const token = "sampleToken";
let candidateJson = ""
let onCandidateAdded = (candidate) => { };

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
        candidateJson = JSON.stringify(event.candidate);
        console.log('[Receiver] onicecandidate', candidateJson);
        document.getElementById('candidateReceiver').innerHTML = candidateJson;
        onCandidateAdded(candidateJson);
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

document.getElementById('testSignalingReceiver').onclick = event => {
    let origin = prompt('Input `address:port` to signaling server');
    let wsReceiver = new WebSocket(`ws://${origin}/wait_offer`);
    wsReceiver.onopen = event => {
        let msg = {
            "token": token
        }
        console.log('[Receiver] wait for sender...', msg);
        wsReceiver.send(JSON.stringify(msg));
    }
    wsReceiver.onmessage = msg => {
        console.log("[Receiver] ws.onmessage: ", msg);
        let json = JSON.parse(msg.data);
        console.log("[Receiver] json", json);

        let sdp = JSON.parse(json.sdp);
        receiverConn.setRemoteDescription(sdp).then(() => {
            return receiverConn.createAnswer();
        }).then((answer) => {
            receiverConn.setLocalDescription(answer);
            let answerJson = JSON.stringify(answer);

            onCandidateAdded = (candidate) => {
                let msg = {
                    "token": token,
                    "sdp": answerJson,
                    "candidate": candidateJson
                };
                let ws = new WebSocket(`ws://${origin}/answer`);
                ws.onopen = event => {
                    console.log('[Receiver] send answer', msg);
                    ws.send(JSON.stringify(msg));

                }
            };
        });

        let candidate = JSON.parse(json.candidate);
        receiverConn.addIceCandidate(candidate).then(() => {
            console.log("[Receiver] candidate added: ", candidate);
        });
    }
}
