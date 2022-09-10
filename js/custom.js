$(document).ready(function () {
    let myChart = undefined;
    let myMobileChart = undefined;
    let taxRate = {
        "yes": {
            type: "Dividend Tax",
            rate: {
                0: 7.5,
                1: 32.5,
                2: 38.5,
            }
        },
        "no": {
            type: "Income Tax",
            rate: {
                0: 20,
                1: 40,
                2: 45,
            }
        },
    };

    /**
     * Change event on dividends input to change tax rate accordingly
     * */
    $(document).on('change', 'input[name=bbcalc_is_dividends]', function () {
        let value = this.value;
        let taxType = document.getElementById('bbcalc_tax-type');

        taxType.innerText = taxRate[value.toLowerCase()].type;
        $(document)
            .find('input[name=bbcalc_income_tax_rate]')
            .each(function (key, input) {
                input.value = taxRate[value.toLowerCase()]['rate'][key];
                input.id = taxRate[value.toLowerCase()]['rate'][key];
                $(input).parent().attr('for', taxRate[value.toLowerCase()]['rate'][key]);
                $(input).parent().find('span').text(taxRate[value.toLowerCase()]['rate'][key] + "%");
            });
    });

    /**
     * Event to trigger when Calculate button is clicked
     * Calculate Tax and plot chart and table
    * */
    $(document).on('click', '#bbcalc_calculate-btn', function () {
        let premium = $('#bbcalc_premium').val();
        let premiumContainer = $("input[name=bbcalc_premium]").parent();
        premiumContainer.removeClass('bbcalc_invalid-input');
        premiumContainer.find('p').remove();

        let premiumy = $('#bbcalc_premium_year').val();
        let premiumContaineyr = $("input[name=bbcalc_premium_year]").parent();
        premiumContaineyr.removeClass('bbcalc_invalid-input');
        premiumContaineyr.find('p').remove();

        if (premium !== null && premium > 0 && premiumy !== null && premiumy > 0) {
            $('#bbcalc_result').slideDown('slow');
            setTimeout(() => {
                document.getElementById('bbcalc_myChart')
                    .scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            }, 500);


            let is_dividends = $('input[name=bbcalc_is_dividends]:Checked').val().toLowerCase() === "yes";

            premium = parseFloat(premium);
            let tax_rate = $('input[name=bbcalc_income_tax_rate]:checked').val();
            $('#bbcalc_premium_value').text("£" + premium);

            if (is_dividends) {
                let gross_salary = parseFloat(premium) / parseFloat(1 - parseFloat(tax_rate / 100));
                let employee_national_insurance = 0;
                let employer_national_insurance = 0;
                let personal_tax = gross_salary - premium - employee_national_insurance;
                let gross_cost = gross_salary + employer_national_insurance;
                let corporationTaxRelief1 =  - parseFloat( (gross_cost / parseFloat(1 - 0.19)) * 0.19);
                let corporationTaxRelief2 = parseFloat((premium / 100) * 19);
                let totalCost1 = gross_cost - corporationTaxRelief1;
                let totalCost2 = premium - corporationTaxRelief2;
                let total_saving_monthly = parseFloat(totalCost1) - parseFloat(totalCost2);
                let total_saving_annually = total_saving_monthly * 12;
                let total_savings = (total_saving_monthly / parseFloat(totalCost1)) * 100;

                $('#bbcalc_plc_gross_salary').text("£" + gross_salary.toFixed(2));
                $('#bbcalc_plc_premium').text("£" + premium.toFixed(2));
                $('#bbcalc_plc_employee_ni').text("£" + employee_national_insurance.toFixed(2));
                $('#bbcalc_plc_personal_tax').text("£" + personal_tax.toFixed(2));

                $('#bbcalc_CTB_employee_ni').text("£" + employer_national_insurance.toFixed(2));
                $('#bbcalc_CTB_premium').text("£" + premium.toFixed(2));
                $('#bbcalc_CTB_grosscost1').text("£" + gross_cost.toFixed(2));
                $('#bbcalc_CTB_grosscost2').text("£" + premium.toFixed(2));
                $('#bbcalc_CTB_taxrelief1').text("£" + corporationTaxRelief1.toFixed(2));
                $('#bbcalc_CTB_taxrelief2').text("£" + corporationTaxRelief2.toFixed(2));
                $('#bbcalc_totalCost1').text("£" + totalCost1.toFixed(2));
                $('#bbcalc_totalCost2').text("£" + totalCost2.toFixed(2));
                $('#bbcalc_totalSaving').text(total_savings.toFixed(2) + "%");
                $('#bbcalc_monthlySaving').text("£" + total_saving_monthly.toFixed(2));
                $('#bbcalc_monthlySavingYear').text("£" + (total_saving_annually).toFixed(2));
                $('#bbcalc_annualSaving').text("£" + (total_saving_annually * premiumy).toFixed(2));

                updateChart(totalCost2, totalCost1);
                updateMobileChart(totalCost2, totalCost1);
            } else {
                let employee_NI = parseInt(tax_rate) < 40 ? 12 : 2;
                let employer_NI = 13.8;
                let corporationTaxReliefRate = 19;

                let tax_employee_NI = parseFloat(tax_rate) + parseFloat(employee_NI);

                let gross_salary = parseFloat(premium) / parseFloat(1 - (tax_employee_NI / 100));
                let employee_national_insurance = (gross_salary / 100 * employee_NI);
                let employer_national_insurance = (gross_salary / 100 * employer_NI);
                let personal_tax = gross_salary - premium - employee_national_insurance;
                let gross_cost = gross_salary + employer_national_insurance;
                let corporationTaxRelief1 = parseFloat((gross_cost / 100) * corporationTaxReliefRate);
                let corporationTaxRelief2 = parseFloat((premium / 100) * corporationTaxReliefRate);
                let totalCost1 = gross_cost - corporationTaxRelief1;
                let totalCost2 = premium - corporationTaxRelief2;
                let total_saving_monthly = parseFloat(totalCost1) - parseFloat(totalCost2);
                let total_saving_annually = total_saving_monthly * 12;
                let total_savings = (total_saving_monthly / parseFloat(totalCost1)) * 100;

                $('#bbcalc_plc_gross_salary').text("£" + gross_salary.toFixed(2));
                $('#bbcalc_plc_premium').text("£" + premium.toFixed(2));
                $('#bbcalc_plc_employee_ni').text("£" + employee_national_insurance.toFixed(2));
                $('#bbcalc_plc_personal_tax').text("£" + personal_tax.toFixed(2));

                $('#bbcalc_CTB_employee_ni').text("£" + employer_national_insurance.toFixed(2));
                $('#bbcalc_CTB_premium').text("£" + premium.toFixed(2));
                $('#bbcalc_CTB_grosscost1').text("£" + gross_cost.toFixed(2));
                $('#bbcalc_CTB_grosscost2').text("£" + premium.toFixed(2));
                $('#bbcalc_CTB_taxrelief1').text("£" + corporationTaxRelief1.toFixed(2));
                $('#bbcalc_CTB_taxrelief2').text("£" + corporationTaxRelief2.toFixed(2));
                $('#bbcalc_totalCost1').text("£" + totalCost1.toFixed(2));
                $('#bbcalc_totalCost2').text("£" + totalCost2.toFixed(2));
                $('#bbcalc_totalSaving').text(total_savings.toFixed(2) + "%");
                $('#bbcalc_monthlySaving').text("£" + total_saving_monthly.toFixed(2));
                $('#bbcalc_monthlySavingYear').text("£" + (total_saving_annually).toFixed(2));
                $('#bbcalc_annualSaving').text("£" + (total_saving_annually * premiumy).toFixed(2));

                updateChart(totalCost2, totalCost1);
                updateMobileChart(totalCost2, totalCost1);
            }
        } else {
            premiumContainer.addClass('bbcalc_invalid-input');
            premiumContainer.append('<p class="bbcalc_error">Please Enter Monthly Premium To Calculate</p>');
            premiumContaineyr.addClass('bbcalc_invalid-input');
            premiumContaineyr.append('<p class="bbcalc_error">Enter How Many Years left on Policy</p>');
        }
    });

    /**
     * Function to initialize Tax chart
     * */
    function initTaxChart() {
        let ctx = $('#bbcalc_myChart');
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Relevant Life Cover', 'Personal Life Cover'],
                datasets: [{
                    // label: 'per month',
                    barThickness: 75,  // for adjusting bar thickness
                    maxBarThickness: 80, // maximum bar thickness
                    // minBarLength: 2,
                    data: [0, 100],
                    backgroundColor: [
                        'rgba(39, 39, 39, 1)',
                        'rgba(39, 39, 39, 1)'
                    ],
                    borderColor: [
                        'rgba(39, 39, 39, 0.4)',
                        'rgba(39, 39, 39, 0.4)'
                    ],
                    borderWidth: 1,
                    borderRadius: Number.MAX_VALUE,
                    borderSkipped: false,
                }]
            },
            options: {
                tooltipTemplate: "<%= value %>",

                showTooltips: true,

                onAnimationComplete: function() {
                    this.showTooltip(this.datasets[0].points, true);
                },
                tooltipEvents: [],
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        // enable the on-canvas tooltip
                        enabled: true,
                        opacity: 1,
                        backgroundColor: 'rgba(255,255,255, 0)', // tooltip background
                        titleAlign: 'center', // alignment for tooltip title
                        bodyAlign: "center", // alignment for tooltip body
                        bodyColor: 'rgb(255,255,255)', // color for body tooltip
                        displayColors: false, // show or hide colored boxes inside tooltip
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.raw || '';

                                if (context.raw !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(context.raw);
                                }
                                return label;
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 1,
                    }
                },
                responsive: true,
                indexAxis: 'y',
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Per Month',
                            color: '#000000',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {top: 20, left: 0, right: 0, bottom: 0}
                        },
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function(value, index, values) {
                                return '£' + value;
                                // return '£' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Function to initialize Tax chart on Mobile
     * */
    function initMobileTaxChart() {
        let ctx = $('#bbcalc_mobileChart');
        myMobileChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Relevant Life Cover', 'Personal Life Cover'],
                datasets: [{
                    // label: 'per month',
                    barThickness: 40,  // for adjusting bar thickness
                    maxBarThickness: 50, // maximum bar thickness
                    data: [0, 100],
                    backgroundColor: [
                        'rgba(39, 39, 39, 1)',
                        'rgba(39, 39, 39, 1)'
                    ],
                    borderColor: [
                        'rgba(39, 39, 39, 0.4)',
                        'rgba(39, 39, 39, 0.4)'
                    ],
                    // borderWidth: 1,
                    // borderRadius: 50,
                    borderWidth: 2,
                    borderRadius: Number.MAX_VALUE,
                    borderSkipped: false,
                }]
            },
            options: {
                tooltipTemplate: "<%= value %>",

                showTooltips: true,

                onAnimationComplete: function() {
                    this.showTooltip(this.datasets[0].points, true);
                },
                tooltipEvents: [],
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.raw || '';

                                if (context.raw !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }).format(context.raw);
                                }
                                return label;
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 1,
                    }
                },
                responsive: true,
                indexAxis: 'x',
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Per Month',
                            color: '#000000',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {top: 20, left: 0, right: 0, bottom: 0}
                        },
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function(value, index, values) {
                                return '£' + value;
                                // return '£' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Function to Update Chart based on Tax Values passed
     * */
    function updateChart(Rlc, Plc) {
        myChart.data.datasets[0].data = [Rlc, Plc];
        myChart.update();
    }

    /**
     * Function to Update Mobile Chart based on Tax Values passed
     * */
    function updateMobileChart(Rlc, Plc) {
        myMobileChart.data.datasets[0].data = [Rlc, Plc];
        myMobileChart.update();
    }

    initTaxChart();
    initMobileTaxChart();
});
