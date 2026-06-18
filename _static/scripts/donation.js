'use strict';

const query = `
query (
  $dateFrom: DateTime
  $dateTo: DateTime
) {
  collective(
    slug: "cryptpad"
  ) {
    summary (
        dateFrom: $dateFrom
        dateTo: $dateTo
    ) {
        contributionTotal {
            value
        }
    }
    transactionReports(
        dateFrom: $dateFrom
        dateTo: $dateTo
    ) {
        nodes {
            date,
            totalChange {
                value
            }
        }
    }
    stats {
      contributionsCount(
        dateFrom: $dateFrom
        dateTo: $dateTo
        includeChildren: false
      )
      balance {
        value
      }
      contributionsAmount(
        dateFrom: $dateFrom
        dateTo: $dateTo
      ) {
        label
        amount {
            value
        }
      }
      contributorsCount(
        includeChildren: false
      )
    }
  }
}
`;

const LS_KEY = 'openCollectiveQuery';

const sendQuery = (dateFrom, dateTo) => {

    if (localStorage[LS_KEY]) {
        const limit = Date.now() - (2 * 60 * 1000); // 2 minutes ago
        let result;
        try {
            result = JSON.parse(localStorage[LS_KEY]);
            if (result?.time > limit) {
                result.value.isCache = true;
                return Promise.resolve(result.value);
            }
        } catch {}
    }

    return fetch('https://api.opencollective.com/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { dateFrom, dateTo },
      }),
    }).then((r) => r.json());
};

const onLoad = () => {
    // fetch recent openCollective data and update progress bar and text

    let section = document.getElementById('donation-progress-bar');
    let bar = document.getElementById('donation-bar');
    let text = document.getElementById('progress-text');
    let textFull = document.getElementById('progress-text-full');
    let goalInput = document.getElementById('donation-goal-value');
    let contributors = document.getElementById('contributors-count');

    // get data from this year
    const year = new Date().getFullYear();
    const dateFrom = `${year}-01-01T00:00:00Z`;
    const dateTo = `${year}-12-31T23:59:59Z`;

    sendQuery(dateFrom, dateTo).then((json) => {
        // Store in cache if needed
        if (!json?.isCache) {
            const toStore = {
                time: Date.now(),
                value: json
            };
            localStorage[LS_KEY] = JSON.stringify(toStore);
        }

        // Show progress bar
        section.style.display = "block";

        const total = json?.data?.collective?.summary?.contributionTotal?.value;
        const current = Math.round(total);
        const goal = Number(goalInput.value) || 0;

        // Update bar
        bar.style.width = `${100*current/goal}%`;

        // Update text
        const percent = Math.round(100*current/goal);
        text.innerText = `${percent}%`;
        textFull.innerText = `(${current}€ of ${goal}€)`;

        const contribCount = json?.data?.collective?.stats?.contributorsCount;
        contributors.innerText = `${contribCount} supporters and counting`;

    }).catch(err => {
        console.error(err);
    });

    // Manage individual/org switch
    let buttonIndiv = document.querySelector('.donation-type[data-type="individual"]');
    let buttonOrg = document.querySelector('.donation-type[data-type="organization"]');
    let listIndiv = document.querySelector('.donation-form-list[data-type="individual"]');
    let listOrg = document.querySelector('.donation-form-list[data-type="organization"]');

    buttonIndiv.addEventListener('click', () => {
        buttonIndiv.classList.add('selected');
        buttonOrg.classList.remove('selected');
        listIndiv.style.display = 'flex';
        listOrg.style.display = 'none';
    });
    buttonOrg.addEventListener('click', () => {
        buttonOrg.classList.add('selected');
        buttonIndiv.classList.remove('selected');
        listOrg.style.display = 'flex';
        listIndiv.style.display = 'none';
    });
};


window.addEventListener('load', onLoad);
