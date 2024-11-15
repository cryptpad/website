const updateLoadingBar = (progress) => {
    const loadingBar = document.querySelector('.loading-bar');
    const progressIndicator = document.querySelector('.progress-indicator');
    if (loadingBar && progressIndicator) {
        const container = loadingBar.parentElement;
        const containerWidth = container.offsetWidth;
        const newWidth = containerWidth * progress;
        loadingBar.style.width = `${newWidth}px`;
        if (progress <= 0.5) {
            progressIndicator.style.left = `${newWidth}px`;
        } else {
            progressIndicator.style.left = `${containerWidth / 2 - 5}px`;
        }
        progressIndicator.textContent = `${Math.round(progress * 100)}%`;
    }
};


const fetchProgressData = () => {
    var jsonDataString = localStorage.getItem('jsonData');
    var jsonData = JSON.parse(jsonDataString);
    var creationProgressInfo = jsonData.creationProgressInfo;
    if (!creationProgressInfo) {
        console.error('creationProgressInfo not found in jsonData');
        return;
    }

    const jobId = creationProgressInfo.jobId;

    if (!jobId) {
        console.error('jobId not found in creationProgressInfo');
        return;
    }
    fetch(`/cloud/create/${jobId}/progress`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const progress = data.progress;
            updateLoadingBar(progress);
            if (progress < 1) {
                setTimeout(fetchProgressData, 1000);
            } else {
                console.log("Instance creation completed!");
                const instanceURL = data.instanceURL;
                if (instanceURL) {
                    setTimeout(() => {
                        window.location.href = `${data.instanceURL}/install/#${data.installToken}`;
                    }, 2000);
                } else {
                    console.error('Instance already in use!');
                }
            }
        })
        .catch(error => {
            console.error('Error fetching progress data:', error);
        });
};


window.addEventListener('load', fetchProgressData);
