#include "./setDelegate/parameter.religo"

/**
 * Entrypoints for wXTZ Oven
 */
type ovenParameter =
| Default
| Withdraw
| SetDelegate(setDelegateParameter)