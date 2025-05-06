import deleteIcon from '/delete-button3.jpg';

export default function Whitelist({
  whitelist,
  setWhitelist,
  onAddToWhitelist = null,
}) {
  const handleAddAddress = () => {
    setWhitelist([...whitelist, '']);
  };

  const handleRemoveAddress = (index) => {
    setWhitelist(whitelist.filter((_, i) => i !== index));
  };

  const handleAddressChange = (index, value) => {
    const updated = [...whitelist];
    updated[index] = value;
    setWhitelist(updated);
  };

  return (
    <div className='whitelist-section'>
      <h3>Whitelist:</h3>
      <div className='btn-add-container'>
        <button type='button' className='btn-add' onClick={handleAddAddress}>
          ➕ Додати адресу
        </button>
      </div>

      {whitelist.map((address, index) => (
        <div key={index} className='option-field'>
          <input
            className='form-control'
            type='text'
            value={address}
            onChange={(e) => handleAddressChange(index, e.target.value)}
            placeholder={`Адреса ${index + 1}`}
            required
          />
          <button
            className='delete_button'
            type='button'
            onClick={() => handleRemoveAddress(index)}
          >
            <img src={deleteIcon} alt='Видалити' className='delete-icon' />
          </button>
        </div>
      ))}

      {onAddToWhitelist && (
        <div className='btn-add-container'>
          <button
            type='button'
            className='btn-submit'
            onClick={() => onAddToWhitelist(whitelist)}
          >
            ➕ Додати до Whitelist
          </button>
        </div>
      )}
    </div>
  );
}
