const localStorageKey = "codeSandBox-jstm";

export const getItemFromStorage = () => {
  try {
    const parseValue = JSON.parse(
      localStorage.getItem(localStorageKey) ?? "{}"
    );
    return parseValue;
  } catch (e) {
    console.log("Error :", e.message);
  }

  return {};
};

export const setItemInLocalStorage = (newValue: Record<string, any>) => {
  const oldValue = getItemFromStorage();
  const updatedValue = JSON.stringify({ ...oldValue, ...newValue });
  localStorage.setItem(localStorageKey, updatedValue);
};
