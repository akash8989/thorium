const mongoose=require("mongoose")
// const { isValid } = require("shortid")
 



let isValid=function(value){
    if(typeof value==="undefined" || typeof value===null) return false
    if(typeof value==="string" && value.trim().length===0) return false
    return true
}

let isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0
}
let isValidObjectId=function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const validstring=function(value){
    if(typeof value==="string" && value.trim().length===0) return false
    return true
}

// const isValidTitle=function(title){
//     return ["Mr","Mrs","Miss"].indexOf(title)!==-1
// }

const validstatus=function(status){
    return["pending","completed","cancelled"].indexOf(status)!==-1
}
const validInteger=function isInteger(value){
    return value % 1==0
}
 const validSize = function (value) {
     return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value).length!=-1
 }

module.exports={
     isValid,
    validInteger,
    validstatus,
    // isValidTitle,
    validstring,
    isValidObjectId,
     isValidrequestBody,
      validSize

}