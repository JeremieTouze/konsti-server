/* @flow */
import type { OpaAssignResults, Group } from 'flow/opaAssign.flow'

export const calculateHappiness = (
  assignment: OpaAssignResults,
  groups: Array<Group>
): number => {
  let happiness = 0
  assignment.forEach(m => {
    const grpInd = groups.findIndex(g => g.id === m.id)
    let ind = groups[grpInd].pref.findIndex(ele => {
      return ele === m.assignment
    })
    ind = ind + 1
    if (ind > 0) {
      happiness = happiness + 1 / ind
    }
  })
  return happiness
}