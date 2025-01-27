export function fetchData(type, url, data = {}) {
    const xhr = new XMLHttpRequest();
    xhr.open(type, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    if (type === "POST" || type === "PUT") {
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    console.log(JSON.parse(xhr.responseText));
                    reject(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        });
    } else {
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.send();
        });
    }
}