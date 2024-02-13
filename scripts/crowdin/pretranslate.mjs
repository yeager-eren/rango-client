const projectId = process.env.CROWDIN_PROJECT_ID;
const token =  process.env.CROWDIN_PERSONAL_TOKEN;

const BASE_URL = `https://api.crowdin.com/api/v2/projects/${projectId}`;
const preTranslateURL = `${BASE_URL}/pre-translations`;
const REQUEST_INTERVAL_TIMEOUT = 10_000;
const MAXIMUM_REQUEST_RETRIES = 12;

const requestData = {
  method: 'mt',
  engineId: 410374,
  autoApproveOption: 'all',
  duplicateTranslations: false,
  skipApprovedTranslations: true,
  translateUntranslatedOnly: true,
  translateWithPerfectMatchOnly: false,
};

const getMachineTranslationEngineID = async () =>{
  try {
    const response = await fetch('https://api.crowdin.com/api/v2/mts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get target language ids`);
    }

    const responseData = await response.json();
    const engineId = responseData.data[0].data.id ;

    return engineId;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

const getLanguageIds = async () => {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get target language ids`);
    }

    const responseData = await response.json();
    const languageIds = responseData.data.targetLanguageIds;

    return languageIds;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const getSourceFileId = async () => {
  try {
    const response = await fetch(`${BASE_URL}/files`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get source file id`);
    }

    const responseData = await response.json();
    const sourceFileId = responseData.data[0].data.id;

    return sourceFileId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const sendPreTranslateRequest = async ({ sourceFileId, languageIds }) => {
  try {
    const response = await fetch(preTranslateURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...requestData, fileIds: [sourceFileId], languageIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate pre-translation. Status: ${response.status}`);
    }

    const responseData = await response.json();
    const preTranslationId = responseData.data.identifier;

    return preTranslationId;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const checkPreTranslateStatus = async (preTranslationId) => {
  const maxAttempts = MAXIMUM_REQUEST_RETRIES;
  let attempt = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(`${preTranslateURL}/${preTranslationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get pre-translation status. Status: ${response.status}`);
      }

      const responseData = await response.json();

      const status = responseData.data.status;

      if (status === 'finished') {
        console.log('Pre-translation finished!');
        process.exit(0);
      } else {
        console.log(`Pre-translation status: ${status}. Retrying in 10 seconds...`);
        await delay(REQUEST_INTERVAL_TIMEOUT);
        attempt++;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  throw new Error('Timeout: Pre-translation did not succeed within the specified time.');
};

(async () => {
  try {
    const [sourceFileId, languageIds] = await Promise.all([getSourceFileId(), getLanguageIds()]);
    const preTranslationId = await sendPreTranslateRequest({ sourceFileId, languageIds });
    await checkPreTranslateStatus(preTranslationId);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();