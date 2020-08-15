/* Practicas de JavaScript */

/* Combinar varios objetos */
const obj1 = { a: 1, b: 2 }
const obj2 = { c: 3 }
const obj3 = { d: 4 }

const objCombined = { ...obj1, ...obj2, ...obj3 }

console.log(objCombined)

/* Insertando valores en un arreglo
 * Agrega un numero 4 en la cuarta posición y no elimina ningún elemento
 * */
const arr = [0, 1, 2, 3, 5, 6, 7, 8]

console.log(`Arreglo antes: ${arr}`)
arr.splice(4, 0, 4)

console.log(`Arreglo después de splice: ${arr}`)

const date = new Date()
console.log(date.getTime())
console.log(+new Date())
console.log(Date.now())

/* Verificar si un elemento se encuentra en un arreglo */

const obj = { data: 1 }
const arreglo = [1, 2, 3]

console.log(Array.isArray(obj)) // false
console.log(Array.isArray(arreglo)) // true

/* Obtener lo valores de un objeto en variables 'destructuring' */

const user = {
  name: 'Arturo',
  age: 37,
  profile: 'https://twitter.com/lgzarturo',
  followers: 1000,
  blogs: 57,
}

const { name, profile, blogs, followers } = user
console.log(name)
console.log(profile)
console.log(blogs)
console.log(followers)

/* Aceptar multiples parámetros en una función 'rest parameters' */

function sum(...values) {
  console.log(values)
  let total = 0
  for (let i = 0; i < values.length; i += 1) {
    total += values[i]
  }
  console.log(`suma: ${total}`)
}
sum(1)
sum(1, 2)
sum(1, 2, 3)
sum(1, 2, 3, 4)
