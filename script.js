$(document).ready(function () {
  const chatbotToggler = $(".chatbot-toggler");
  const closeBtn = $(".close-btn");
  const chatbox = $(".chatbox");
  const chatInput = $(".chat-input textarea");
  const sendChatBtn = $(".chat-input span");

  let userMessage = null; // Variable to store user's message
  const inputInitHeight = chatInput[0].scrollHeight;

  // API configuration
  const API_KEY = "AIzaSyC_JJsQJWh-zT5WkK99gvqFVJHCL8r8HZs"; // Your API key here
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = $("<li>").addClass("chat").addClass(className);
    const chatContent =
      className === "outgoing"
        ? "<p></p>"
        : '<span class="material-symbols-outlined">smart_toy</span><p></p>';
    chatLi.html(chatContent);
    chatLi.find("p").text(message);
    return chatLi; // return chat <li> element
  };

  const generateResponse = async (chatElement) => {
    const messageElement = chatElement.find("p");

    // Define the properties and message for the API request
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    };

    // Send POST request to API, get response and set the response as paragraph text
    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      // Get the API response text and update the message element
      messageElement.text(
        data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1")
      );
    } catch (error) {
      // Handle error
      messageElement.addClass("error");
      messageElement.text(error.message);
    } finally {
      chatbox.scrollTop(chatbox[0].scrollHeight);
    }
  };

  const handleChat = () => {
    userMessage = chatInput.val().trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.val("");
    chatInput.height(inputInitHeight);

    // Append the user's message to the chatbox
    chatbox.append(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTop(chatbox[0].scrollHeight);

    setTimeout(() => {
      // Display "Thinking..." message while waiting for the response
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.append(incomingChatLi);
      chatbox.scrollTop(chatbox[0].scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);
  };

  chatInput.on("input", function () {
    // Adjust the height of the input textarea based on its content
    chatInput.height(inputInitHeight);
    chatInput.height(this.scrollHeight);
  });

  chatInput.on("keydown", function (e) {
    // If Enter key is pressed without Shift key and the window
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && $(window).width() > 800) {
      e.preventDefault();
      handleChat();
    }
  });

  sendChatBtn.on("click", handleChat);
  closeBtn.on("click", function () {
    $("body").removeClass("show-chatbot");
  });
  chatbotToggler.on("click", function () {
    $("body").toggleClass("show-chatbot");
  });
});
