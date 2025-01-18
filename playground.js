
data = {
        "id": "3136f54f-4a49-4ad8-8365-447b545f60bd",
        "name": "Nodejs Fundamentals",
        "description": "Learn the basics of node js in this beginner level course",
        "instructor": "6a8a4946-5ba8-4e09-9020-032033d9209c",
        "price": null,
        "difficulty": "beginner",
        "prerequisites": null,
        "coverimage": null,
        "iscertified": false,
        "isavailable": true,
        "createdAt": "2025-01-16T22:25:34.024Z",
        "updatedAt": null
    }


// console.log(Object.entries(data) instanceof Array)
// console.log(Object.entries(data)[3])

const fields = []
const values = []
Object.entries(data).map((entry, index)=>{
    fields.push(`${entry[0]}=$${index+1}`)
    values.push(entry[1])
})

console.log(fields)
console.log(values)
