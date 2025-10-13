import axios from "axios";

async function getAdminInfo() {
    try {
        return (await axios.get(`${process.env.BASE_API_URL}/admins/user-info?language=${process.env.defaultLanguage}`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        })).data;
    }
    catch (err) {
        throw err;
    }
}

const handleSelectUserLanguage = (userLanguage, changeLanguageFunc) => {
    changeLanguageFunc(userLanguage);
    document.body.lang = userLanguage;
}

const getDateFormated = (date) => {
    let orderedDateInDateFormat = new Date(date);
    const year = orderedDateInDateFormat.getFullYear();
    const month = orderedDateInDateFormat.getMonth() + 1;
    const day = orderedDateInDateFormat.getDate();
    return `${year} / ${month} / ${day}`;
}

export {
    getAdminInfo,
    handleSelectUserLanguage,
    getDateFormated,
}