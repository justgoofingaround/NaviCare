// assets/js/state.js
window.NC = window.NC || {};
NC.state = JSON.parse(localStorage.getItem('nc_state') || '{}');

NC.setState = (partial) => {
  NC.state = { ...NC.state, ...partial };
  localStorage.setItem('nc_state', JSON.stringify(NC.state));
};

NC.clearState = () => {
  NC.state = {};
  localStorage.removeItem('nc_state');
};

NC.requireIntake = () => Boolean(NC.state.symptoms);
