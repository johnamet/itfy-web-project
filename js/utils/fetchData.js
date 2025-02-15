export function fetchData(type, url, data = {}) {
    const xhr = new XMLHttpRequest();
    xhr.open(type, url, true);

    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
        xhr.setRequestHeader("authorization", `Bearer ${accessToken}`);
    }

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


export function uploadImage(url, category, entityId, file) {
    const formData = new FormData();
    formData.append('category', category);
    formData.append('entityId', entityId);
    formData.append('file', file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('accept', '*/*');
        // Do not set Content-Type header for multipart/form-data

        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(xhr.responseText);
            }
        };

        xhr.onerror = () => {
            reject('Network error');
        };

        xhr.send(formData);
    });
}