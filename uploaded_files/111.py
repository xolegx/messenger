
   const userId = '/* user id */';
   const socket = new WebSocket(ws:'//localhost:8000/ws/${userId}');

   socket.onopen = function(event) {
       console.log("Connected to WebSocket server");
   };

   socket.onmessage = function(event) {
       // Обновление индикатора статуса
       updateStatusIndicator(event.data);
   };

   socket.onclose = function(event) {
       console.log("Disconnected from WebSocket server");
   };

   function updateStatusIndicator(status) {
       const indicator = document.getElementById(status-indicator-${userId});
       indicator.textContent = status;
       indicator.style.color = status === 'online' ? 'green' : 'red';
   }
   
