#include "../../../partials/wxtz/getViews/storage.religo"
#include "../../../partials/wxtz/getViews/parameter.religo"
#include "../../../partials/wxtz/getViews/constants.religo"

#include "../../../partials/wxtz/getViews/requestBalance.religo"
#include "../../../partials/wxtz/getViews/requestAllowance.religo"
#include "../../../partials/wxtz/getViews/requestTotalSupply.religo"
#include "../../../partials/wxtz/getViews/requestSwap.religo"



let main = ((parameter, storage): (parameter, storage)) => {
    switch(parameter) {
        | RequestBalance(requestParameter) => requestBalance(requestParameter, storage)
        | RequestAllowance(requestAllowanceParameter) => requestAllowance(requestAllowanceParameter, storage)
        | RequestSwap(requestSwapParameter) => requestSwap(requestSwapParameter, storage)
        | RequestTotalSupply(requestTotalSupplyParameter) => requestTotalSupply(requestTotalSupplyParameter, storage)
        | Receive(response) => {
            switch (response) {
                | GetAllowanceResponse(value) => { 
                    (emptyListOfOperations, {
                        ...storage,
                        allowance: value,
                    })
                }
                | GetBalanceResponse(value) => {
                    (emptyListOfOperations, {
                        ...storage,
                        balance: value,
                    })
                }
                | GetTotalSupplyResponse(value) => {
                    (emptyListOfOperations, {
                        ...storage,
                        totalSupply: value,
                    })
                }
                | GetSwapResponse(value) => {
                    (emptyListOfOperations, {
                        ...storage,
                        swap: value
                    })
                }
            };
        };
    };
};
