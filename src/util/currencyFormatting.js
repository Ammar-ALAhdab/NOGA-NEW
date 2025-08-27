function currencyFormatting(number) {
  const formattedNumber = new Intl.NumberFormat("en-US").format(number);
  return `${formattedNumber} ل.س`;
}

export default currencyFormatting;
