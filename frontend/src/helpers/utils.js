const formatDate = (isoString) => {
    if (!isoString) return "";
    const dateObject = new Date(isoString);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
    };
    return dateObject.toLocaleTimeString(undefined, options);
};

export default formatDate;