function ThemeChanger() {
  const handleChange = (e) => {
    document.documentElement.style.setProperty('--background', e.target.value);
  };

  return (
    <div className="p-4">
      <label>Pick background: </label>
      <input type="color" onChange={handleChange} />
    </div>
  );
}