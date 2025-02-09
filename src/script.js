document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "YOUR_RAPIDAPI_KEY"; 

    const editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        autoCloseBrackets: true
    });

    function encode(str) {
        return btoa(unescape(encodeURIComponent(str || "")));
    }

    function decode(bytes) {
        return decodeURIComponent(escape(atob(bytes || "")));
    }

    function errorHandler(jqXHR) {
        document.getElementById("output").value = JSON.stringify(jqXHR, null, 4);
        document.getElementById("run").disabled = false;
    }

    function checkStatus(token) {
        fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key": API_KEY
            }
        })
        .then(response => response.json())
        .then(data => {
            if ([1, 2].includes(data["status"]["id"])) {
                setTimeout(() => checkStatus(token), 1000);
            } else {
                document.getElementById("output-container").style.display = "block";
                document.getElementById("output").value = `${data["status"]["description"]}\n${decode(data["stdout"])}`;
                document.getElementById("run").disabled = false;
            }
        })
        .catch(errorHandler);
    }

    document.getElementById("run").addEventListener("click", () => {
        document.getElementById("run").disabled = true;
        fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false", {
            method: "POST",
            headers: {
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "language_id": document.getElementById("lang").value,
                "source_code": encode(editor.getValue()),
                "stdin": encode(document.getElementById("input").value),
                "redirect_stderr_to_stdout": true
            })
        })
        .then(response => response.json())
        .then(data => {
            setTimeout(() => checkStatus(data["token"]), 2000);
        })
        .catch(errorHandler);
    });
});
