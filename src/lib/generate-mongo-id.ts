export const generateMongoId = async () => {
  const response = await fetch("/api/generate-object-id");
  const data = await response.json();
  return data.objectId;
};
