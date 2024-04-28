const updateLoadingBar = (progress) => {
    const loadingBar = document.querySelector('.loading-bar');
    const progressIndicator = document.querySelector('.progress-indicator');
    if (loadingBar && progressIndicator) {
        const container = loadingBar.parentElement; 
        const containerWidth = container.offsetWidth;
        const newWidth = containerWidth * progress;
        const clampedProgress = Math.max(0, Math.min(progress, 1));
        loadingBar.style.width = `${newWidth}px`;
        if (progress <= 0.5) {
            progressIndicator.style.left = `${newWidth}px`;
        } else {
            progressIndicator.style.left = `${containerWidth / 2}px`;
        }
        progressIndicator.textContent = `${Math.round(progress * 100)}%`;
    }
};


const fetchProgressData = () => {
    var jsonDataString = localStorage.getItem('jsonData'); 
    var jsonData = JSON.parse(jsonDataString); 
    var creationProgressInfo = jsonData.creationProgressInfo;
    console.log(jsonData)
    if (!creationProgressInfo) {
        console.error('creationProgressInfo not found in jsonData');
        return;
    }

    const jobId = creationProgressInfo.jobId;
    console.log("jobId:", jobId);

    if (!jobId) {
        console.error('jobId not found in creationProgressInfo');
        return;
    }
    fetch(`http://localhost:3004/cloud/create/${jobId}/progress`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            const progress = data.progress;
            console.log("Progress:", progress);
            updateLoadingBar(progress);
            if (progress < 1) {
                setTimeout(fetchProgressData, 1000); 
            } else {
                console.log("Instance creation completed!");
                //window.location.href = data.instanceURL;
            }
        })
        .catch(error => {
            console.error('Error fetching progress data:', error);
        });
};

window.addEventListener('load', fetchProgressData);
