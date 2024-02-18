import { CrowdinError } from "../common/errors.mjs";

const PROJECT_ID = process.env.CROWDIN_PROJECT_ID;
const TOKEN =  process.env.CROWDIN_PERSONAL_TOKEN;

const BASE_URL = `https://api.crowdin.com/api/v2`;
const BASE_PROJECT_URL = `${BASE_URL}/projects/${PROJECT_ID}`;
const REQUEST_INTERVAL_TIMEOUT = 10_000;
const MAXIMUM_PRETRANSLATION_STATUS_CHECK = 20;

const requestData = {
  method: 'mt',
  autoApproveOption: 'all',
  duplicateTranslations: false,
  skipApprovedTranslations: true,
  translateUntranslatedOnly: true,
  translateWithPerfectMatchOnly: false,
};

const getMachineTranslationEngineID = async () => {
  try {
    const response = await fetch(`${BASE_URL}/mts`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw 'Failed to get machine translation data';
    }

    const responseData = await response.json();
    const engineId = responseData.data[0].data.id;

    return engineId;
  } catch (error) {
    console.error('Error:', error);    
    throw new CrowdinError(error);
  }
};

const getLanguageIds = async () => {
  try {
    const response = await fetch(BASE_PROJECT_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw 'Failed to get target language ids';
    }

    const responseData = await response.json();
    const languageIds = responseData.data.targetLanguageIds;

    return languageIds;
  } catch (error) {
    console.error('Error:', error);
    throw new CrowdinError(error);
  }
};

const getSourceFileId = async () => {
  try {
    const response = await fetch(`${BASE_PROJECT_URL}/files`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw 'Failed to get source file id';
    }

    const responseData = await response.json();
    const sourceFileId = responseData.data[0].data.id;

    return sourceFileId;
  } catch (error) {
    console.error('Error:', error);
    throw new CrowdinError(error);
  }
};

const sendPreTranslateRequest = async ({ sourceFileId, languageIds }) => {
  try {
    const engineId = await getMachineTranslationEngineID();
    console.log('engineId', engineId);
    requestData.engineId = engineId ;
    const response = await fetch(`${BASE_PROJECT_URL}/pre-translations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        ...requestData,
        fileIds: [sourceFileId],
        languageIds,
      }),
    });

    if (!response.ok) {
      throw `Failed to initiate pre-translation. Status: ${response.status}`;
    }

    const responseData = await response.json();
    const preTranslationId = responseData.data.identifier;

    return preTranslationId;
  } catch (error) {
    console.error('Error:', error);
    throw new CrowdinError(error);
  }
};

const checkPreTranslateStatus = async (preTranslationId) => {
  const maxAttempts = MAXIMUM_PRETRANSLATION_STATUS_CHECK;
  let attempt = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(`${BASE_PROJECT_URL}/pre-translations/${preTranslationId}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (!response.ok) {
        throw `Failed to get pre-translation status. Status: ${response.status}`;
      }

      const responseData = await response.json();

      const status = responseData.data.status;

      if (status === 'finished') {
        console.log('Pre-translation finished!');
        process.exit(0);
      } else {
        console.log(
          `Pre-translation status: ${status}. Retrying in 10 seconds...`
        );
        await delay(REQUEST_INTERVAL_TIMEOUT);
        attempt++;
      }
    } catch (error) {
      console.error('Error:', error);
      throw new CrowdinError(error);
    }
  }
  throw new CrowdinError('Timeout: Pre-translation did not succeed within the specified time.');
};

(async () => {
  try {
    if(!PROJECT_ID || !PROJECT_ID){
      throw new CrowdinError('environments are not set correctly');
    }
    const [sourceFileId, languageIds] = await Promise.all([getSourceFileId(), getLanguageIds()]);
    console.log('sourceFileId', sourceFileId);
    console.log('languageIds', languageIds);
    const preTranslationId = await sendPreTranslateRequest({ sourceFileId, languageIds });
    await checkPreTranslateStatus(preTranslationId);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
