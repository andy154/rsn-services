<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
    enum TaxSystem {
        OSN = 'ОСН',
        USN_DR = 'УСН Д-Р',
        USN_D = 'УСН Д'
    }
    type Company = {
        name: string;
        nds: number;
        tax: number;
        taxSystem: TaxSystem;
    };

    const companys: Company[] = [
        {name: 'ООО "РСН" (НДС 20%)', taxSystem: TaxSystem.OSN, nds: 20, tax: 25},
        {name: 'ООО "Р-Сувенир" (УСН Д-Р 15%)', taxSystem: TaxSystem.USN_DR, nds: 5, tax: 15},
        {name: 'ООО "Р-Сувенир" (УСН Д 7%)', taxSystem: TaxSystem.USN_D, nds: 0, tax: 7},
    ];

    const cashPercent = 0.15;

    const company = ref<Company|null>(null);
    const price = ref(null);
    const costpriceWithNDS = ref(null);
    const costpriceWithoutNDS = ref(null);
    const costprice = ref<number|null>(null);
    const cash = ref(null);

    watch([costpriceWithNDS, costpriceWithoutNDS], () => {
        costprice.value = (costpriceWithNDS.value || 0) + (costpriceWithoutNDS.value || 0);
    });

    const cashPrice = computed(() => {
        if (!cash.value) return null;
        if (!company.value) return null;
        if (company.value.taxSystem == TaxSystem.USN_D) return 0;
        return cash.value * cashPercent;
    });
    const nds = computed(() => {
        if (!company.value || !price.value || company.value.taxSystem == TaxSystem.USN_D) return null;
        if (company.value.taxSystem == TaxSystem.OSN) {
            return (price.value - price.value / (1 + company.value.nds/100))
                - (costpriceWithNDS.value ? (costpriceWithNDS.value - costpriceWithNDS.value / (1 + company.value.nds/100)) : 0);
        } else if (company.value.taxSystem == TaxSystem.USN_DR) {
            return price.value - price.value / (1 + company.value.nds/100);
        }
    });

    const tax = computed(() => {
       if (!company.value || !price.value) return null;
       let sum = price.value
            - (cash.value || 0)
            - (cashPrice.value || 0)
            - (nds.value || 0);
       switch (company.value.taxSystem as TaxSystem) {
           case TaxSystem.OSN:
               sum += -(costpriceWithNDS.value || 0) - (costpriceWithoutNDS.value || 0);
            break;
           case TaxSystem.USN_DR:
               sum -= costprice.value || 0;
            break;
           case TaxSystem.USN_D:
               sum = price.value;
            break;
       }
       return sum*company.value.tax/100;
    });

    const expenses = computed(() => {
        if (!company.value) return null;
        const mainExpenses =  company.value.taxSystem == TaxSystem.OSN ? ((costpriceWithNDS.value || 0) + (costpriceWithoutNDS.value || 0)) : (costprice.value || 0);
        const advExpenses = (cash.value || 0) + (cashPrice.value || 0) + (nds.value || 0) + (tax.value || 0);
        return mainExpenses + advExpenses;
    });

    const profit = computed(() => {
        if (!expenses.value || !price.value) return null;
        return price.value - (expenses.value || 0);
    })

    const margin = computed(() => {
        if (!profit.value) return null;
        return profit.value / (price.value || 0) * 100;
    })

    function moneyFormat(num: number) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

</script>

<template>
    <v-container class="cont">
      <v-card class="centered-card">
        <v-card-title>Налоговый калькулятор</v-card-title>
        <v-card-text>
            <v-select v-model="company" return-object label="Наше юр.лицо" :items="companys" item-title="name" item-value="id" clearable></v-select>
            <v-text-field v-if="company" v-money-format v-model.number="price" label="Сумма РРЦ, руб."></v-text-field>
            <v-text-field v-if="company?.nds == 20" v-model.number="costpriceWithNDS" label="Себестоимость с НДС, руб."></v-text-field>
            <v-text-field v-if="company?.nds == 20" v-model.number="costpriceWithoutNDS" label="Себестоимость БЕЗ НДС, руб."></v-text-field>
            <v-text-field v-if="company&&company?.nds != 20" v-model.number="costprice" label="Себестоимость, руб."></v-text-field>
            <v-text-field v-if="company" v-model.number="cash" label="Сумма расхода наличными без чеков, руб."></v-text-field>

            <v-card v-if="profit" class="total">
                <v-card-text>
                    <p v-if="cashPrice">Сумма конвертации в наличные: <b>{{ moneyFormat(cashPrice) }}</b> руб.</p>
                    <p v-if="nds">НДС: <b>{{ moneyFormat(nds) }}</b> руб.</p>
                    <p v-if="company&&tax">Налог на {{ company.taxSystem == TaxSystem.USN_D ? 'доход' : 'прибыль' }}: <b>{{ moneyFormat(tax) }}</b> руб.</p>
                    <hr>
                    <p v-if="company&&margin">Маржинальность: <b>{{ margin.toFixed(2) }}</b> %</p>
                    <p v-if="company&&profit">Маржа: <b>{{ moneyFormat(profit) }}</b> руб.</p>
                </v-card-text>
            </v-card>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <style scoped>
  .cont {
    width: 100vw;
    display: flex;
    justify-content: center;
  }
  .centered-card {
    width: 50vw; /* Половина ширины экрана */
    padding: 20px;
    text-align: center;
  }
  .total {
    text-align: right;
  }
  </style>