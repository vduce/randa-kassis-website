const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BUNNY_API_KEY = "050f79c7-6c05-464f-beab-ff2a8a24c4e521376642-864b-4360-a16b-0e59d653b6f5";
const STORAGE_ZONE_NAME = "randa-kassis-website";
const BASE_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}/`;

const throughMyEyesSections = [
  {
    sectionName: "intheirgaze",
  },
  {
    sectionName: "artinmotion/photos",
  },
  {
    sectionName: "ruinsthatspeaks/photos",
  },
  {
    sectionName: "testamentsinstone/photos",
  },
  {
    sectionName: "pulseofearth/photos",
  },
  {
    sectionName: "tracyofatrocity",
  },
];

const fetchAndSaveImages = async () => {
  for (const section of throughMyEyesSections) {
    const folderPath = `gallery/throughmyeyes/${section.sectionName}/`;
    const url = `${BASE_URL}${folderPath}`;

    try {
      const response = await axios.get(url, {
        headers: {
          AccessKey: BUNNY_API_KEY,
          Accept: "application/json",
        },
      });

      const images = response.data
        .filter((item) => !item.IsDirectory)
        .map((item) => item.ObjectName);

      const jsonFileName = section.sectionName.replace(/\//g, "_") + ".json";
      const jsonFilePath = path.join(
        __dirname,
        "..",
        "public",
        "gallery",
        "myeyes",
        "file_lists",
        jsonFileName
      );

      fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
      fs.writeFileSync(jsonFilePath, JSON.stringify({ images }, null, 2));
      console.log(`Successfully fetched and saved image list for ${section.sectionName}`);
    } catch (error) {
      console.error(
        `Error fetching images for ${section.sectionName}:`,
        error.response ? error.response.data : error.message
      );
    }
  }
};

fetchAndSaveImages();
