// There is a trailing comma at the end of this file to
// mitigate `#include` issues in the parent file
((parameter, storage): (ovenParameter, ovenStorage)): (list(operation), ovenStorage) => {
    (([]: list(operation)), storage)
},