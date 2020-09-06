generateMessage = (username, message) => {
  return {
    username,
    text: message,
    createdAt: new Date().getTime(),
  };
};


generateLocationMessage = (username, url) => {
    return {
      username,
      url: url,
      createdAt: new Date().getTime(),
    };
  };
  
module.exports = {
    generateMessage,
    generateLocationMessage
}