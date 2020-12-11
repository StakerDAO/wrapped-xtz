#include "./setDelegate/parameter.religo"
#include "./withdraw/parameter.religo"

/**
 * Entrypoints for wXTZ Oven
 */
type ovenParameter =
| Default
| Withdraw(withdrawParameter)
| SetDelegate(setDelegateParameter)
