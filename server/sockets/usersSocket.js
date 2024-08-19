let usersInRooms = {};

export default function usersSocket(io, socket) {
  socket.on("joinToBlockRoom", ({ blockId }) => {
    socket.join(blockId);
    if (!usersInRooms[blockId]) {
      usersInRooms[blockId] = [];
    }
    usersInRooms[blockId].push(socket.id);
    if (usersInRooms[blockId].length === 1) {
      socket.emit("setRoleForUser", "mentor");
    } else {
      socket.emit("setRoleForUser", "student");
    }
    io.to(blockId).emit("userCountUpdate", usersInRooms[blockId].length);
  });

  socket.on("UserLeaveBlockRoom", ({ blockId }) => {
    if (usersInRooms[blockId][0] === socket.id) {
      io.to(blockId).emit("userCountUpdate", usersInRooms[blockId].length - 1);
      io.to(blockId).emit("resetCodeMentorLeft");
      delete usersInRooms[blockId];
    } else {
      usersInRooms[blockId] = usersInRooms[blockId].filter(
        (id) => id !== socket.id
      );
      io.to(blockId).emit("userCountUpdate", usersInRooms[blockId].length);
      if (usersInRooms[blockId].length === 0) {
        delete usersInRooms[blockId];
      }
    }
    socket.leave(blockId);
  });

  socket.on(
    "codeChangeInBlockRoom",
    ({ blockId, newCode, newCodeWithoutComments, solution }) => {
      io.to(blockId).emit("updateCodeInBlookRoom", newCode);
      let checkSolution;
      if (newCodeWithoutComments === solution) {
        checkSolution = true;
      } else {
        checkSolution = false;
      }
      io.to(blockId).emit("showSmileyInBlockRoom", checkSolution);
    }
  );

  socket.on("disconnect", () => {
    let blockIdToReset = null;
    for (let blockId in usersInRooms) {
      if (
        usersInRooms[blockId].length > 0 &&
        usersInRooms[blockId][0] === socket.id
      ) {
        blockIdToReset = blockId;
      }
      usersInRooms[blockId] = usersInRooms[blockId].filter(
        (id) => id !== socket.id
      );
      io.to(blockId).emit("userCountUpdate", usersInRooms[blockId].length);
      if (usersInRooms[blockId].length === 0) {
        delete usersInRooms[blockId];
      }
      if (blockIdToReset) {
        io.to(blockIdToReset).emit("resetCodeMentorLeft");
        delete usersInRooms[blockIdToReset];
        break;
      }
    }
  });
}
