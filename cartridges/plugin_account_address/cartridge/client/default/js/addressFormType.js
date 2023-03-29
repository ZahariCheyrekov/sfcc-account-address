const radioBturrons = document.querySelectorAll('.js-form-radion-button');
const companyNameSection = document.querySelector('.js-company-name-vat')

radioBturrons.forEach(radioButton => {
    radioButton.onchange = () => {
        const addressType = radioButton.value;

        switch (addressType) {
            case "Private Address":
                companyNameSection.classList.add('d-none');
                break;
            case "Business Address":
                companyNameSection.classList.remove('d-none');
                break;
        }
    }
});
