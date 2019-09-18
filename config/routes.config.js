//list our routes in the flow order in the app
//for address edit and marital status edit, I am specifically pointing to data that does not exist, to force skipping the route when navigating back
const routes = [
  { path: '/start' },
  { path: '/login/code' },
  { path: '/offramp', editInfo: 'skip' },
  { path: '/login/sin' },
  { path: '/login/dateOfBirth' },
  { path: '/personal/name' },
  { path: '/offramp/name', editInfo: 'skip' },
  { path: '/personal/residence' },
  { path: '/offramp/residence', editInfo: 'skip' },
  { path: '/personal/address' },
  { path: '/financial/income' },
  { path: '/offramp/financial', editInfo: 'skip' },
  { path: '/deductions/rrsp' },
  { path: '/deductions/rrsp/amount', editInfo: 'deductions.rrspClaim' },
  { path: '/personal/maritalStatus' },
  { path: '/deductions/medical' },
  { path: '/deductions/medical/amount', editInfo: 'deductions.medicalExpenseClaim' },
  { path: '/deductions/political' },
  { path: '/deductions/political/amount', editInfo: 'deductions.politicalContributionClaim' },
  { path: '/deductions/donations' },
  { path: '/deductions/donations/amount', editInfo: 'deductions.charitableDonationAmount' },
  { path: '/trillium/rent' },
  { path: '/trillium/rent/amount', editInfo: 'deductions.trilliumRentAmount' },
  { path: '/trillium/propertyTax' },
  { path: '/trillium/propertyTax/amount', editInfo: 'deductions.trilliumPropertyTaxAmount' },
  { path: '/trillium/studentResidence' },
  { path: '/trillium/energy' },
  { path: '/trillium/energy/amount', editInfo: 'deductions.trilliumEnergyAmount' },
  { path: '/trillium/longTermCare/amount', editInfo: 'deductions.trilliumLongTermCareAmount' },
  { path: '/deductions/climate-action-incentive' },
  { path: '/review' },
  { path: '/confirmation' },
]

module.exports = {
  routes,
}