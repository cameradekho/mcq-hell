export function createTempId() {
    //this ID is used to generate temporary IDs for client-side operations, It will get replace by ObjectID by server
  const tempId = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return tempId;
}
