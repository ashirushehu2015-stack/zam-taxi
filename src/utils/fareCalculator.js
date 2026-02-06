const calculateFare = (distanceKm, durationType) => {
  const baseFare = 500; // NGN
  const costPerKm = 100; // NGN
  let multiplier = 1;

  if (durationType === 'peak') {
    multiplier = 1.5;
  }

  return (baseFare + (distanceKm * costPerKm)) * multiplier;
};

module.exports = calculateFare;
