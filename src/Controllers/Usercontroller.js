const UserModel=require("../models/Usermodel")
const jwt=require("jsonwebtoken")
const mongoose=require("mongoose")
const validator=require("../validators/validator")
const aws=require("../validators/aws")
const bcrypt=require("bcrypt")
// const saltRounds=10;



 function Checkphone(number){
    if (/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(number)) {
        return true
    }
    return false
 }

 const registerUser = async function (req, res) {
    try {

        const requestBody = req.body.data
        const JSONbody = JSON.parse(requestBody)

        if (!validator.isValidrequestBody(JSONbody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        //extract param
        const { fname, lname, email, password, phone, address } = JSONbody

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: 'first name is not valid' })

        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: 'last name is not valid' })

        }

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        }

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        }

        if (!((password.length > 7) && (password.length < 16))) {

            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })

        }
        if (!Checkphone(phone.trim())) {
            return res.status(400).send({ status: false, msg: "The phone no. is not valid" })
        }
        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, msg: "Address is mandatory" })
        }
        if (!validator.isValid(address.shipping)) {
            return res.status(400).send({ status: false, msg: "Shipping address is missing mandatory fields" })

        }
        if (!validator.isValid(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "Some shipping address details or detail are/is missing" })
        }
        if (!validator.isValid(address.billing)) {
            return res.status(400).send({ status: false, msg: "Billing address is missing mandatory fields" })
        }
        if (!validator.isValid(address.billing.street && address.billing.city && address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Some billing address details or detail are/is missing" })
        }
        const isNumberorEmailAlreadyUsed = await UserModel.findOne({ phone }, { email });
        if (isNumberorEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} number or ${email} mail is already registered` })
            return
        }
        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }
        let files = req.files;
        if (files && files.length > 0) {
            //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
            let uploadedFileURL = await aws.uploadFile(files[0]); // expect this function to take file as input and give url of uploaded file as output 
            //    res.status(201).send({ status: true, data: uploadedFileURL });
            const EncrypPassword = await bcrypt.hash(password, 10)
            // console.log(EncrypPassword)
            profileImage = uploadedFileURL
            const userData = { fname, lname, email, phone, profileImage, password: EncrypPassword, address }
            let saveduser = await UserModel.create(userData)
            res.status(201).send({ status: true, message: 'user created succesfully', data: saveduser })
        }
        else {
            res.status(400).send({ status: false, msg: "No file to write" });
        }


    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}
// module.exports.registerUser=registerUser
// #####################################################################################################################################################3
const login = async function (req, res) {
    try {

        const requestBody = req.body
        if (!validator.isValidrequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        let email = req.body.email
        let password = req.body.password

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        //  email = email.trim();

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }


        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: 'password must be present' })
            return
        }
        // Password length validation
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }

        if (email && password) {
            let User = await UserModel.findOne({ email: email })
            if (!User) {
                return res.status(400).send({ status: false, msg: "email does not exist" })
            }
            let decryppasss = await bcrypt.compare(password, User.password);

            if (decryppasss) {
                const Token = jwt.sign({
                    userId: User._id,
                    // iat: Math.floor(Date.now() / 1000), //issue date
                    // exp: Math.floor(Date.now() / 1000) + 30 * 60
                }, "Group5") //exp date 30*60=30min
                // res.header('x-api-key', Token)

                res.status(200).send({ status: true, msg: "success", data: { userId: User._id, token: Token } })
            } else {
                res.status(400).send({ status: false, Msg: "Invalid password" })
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
//==============================================================================================
//GET USER
const GetUsers = async function (req, res) {
    try {
        console.log(req.user)
        if (req.user.userId != req.params.userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        let userId = req.params.userId
        console.log(userId)
        let findUserId = await UserModel.findOne({ _id: userId })
        if (findUserId) {
            res.status(200).send({ status: true, msg: "User Profile details", data: findUserId })
        }

    } catch (err) {
        res.staus(500).send({ status: false, msg: err.message })
    }
}
//=====================================================================


const update = async function (req, res) {
    try {
        let files = req.files;
        const requestBody = JSON.parse(req.body.data)
        userId = req.params.userId
        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is invalid` })
            return
        }
        const userFound = await UserModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, message: `User do not exists` })
        }
        //Authorisation
        if (userId.toString() !== req.user.userId) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }
        if (!validator.isValidrequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide details to update' })
            return
        }
        // destructuring the body
        let { fname, lname, email, phone, password, address } = requestBody;
        let updateUserData = {}
        if (!validator.validstring(fname)) {
            return res.status(400).send({ status: false, message: 'fname Required' })
        }
        if (validator.isValid(fname)) {
            updateUserData['fname'] = fname
        }
        if (!validator.validstring(lname)) {
            return res.status(400).send({ status: false, message: 'lname Required' })
        }
        if (validator.isValid(lname)) {
            updateUserData['lname'] = lname
        }
        if (!validator.validstring(email)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. email required' })
        }
        if (validator.isValid(email)) {
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
                res.status(400).send({ status: false, message: `Email should be a valid email address` })
            }
            const duplicateEmail = await UserModel.find({ email: email })
            if (duplicateEmail.length) {
                res.status(400).send({ status: false, message: 'email already exists' })
            }
            updateUserData['email'] = email
        }
        if (validator.isValid(phone)) {
            if (!(/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phone.trim()))) {
                res.status(400).send({ status: false, message: `Please provide valid phone number` })
            }
            const duplicatePhone = await UserModel.find({ phone: phone })
            if (duplicatePhone.length) {
                res.status(400).send({ status: false, message: 'phone already exists' })
            }
            updateUserData['phone'] = phone
        }
        if (validator.isValid(password)) {
            const encrypt = await bcrypt.hash(password, 10)
            updateUserData['password'] = encrypt
        }
        if (address) {
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!validator.isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street to update' })
                    }
                    updateUserData['address.shipping.street'] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!validator.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city name to update' })
                    }
                    updateUserData['address.shipping.city'] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (typeof address.shipping.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode to update' })
                    }
                    updateUserData['address.shipping.pincode'] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!validator.isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street to update' })
                    }
                    updateUserData['address.billing.street'] = address.billing.street
                }
                if (address.billing.city) {
                    if (!validator.isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city to update' })
                    }
                    updateUserData['address.billing.city'] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (typeof address.billing.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode to update' })
                    }
                    updateUserData['address.billing.pincode'] = address.billing.pincode
                }
                if (!(files && files.length > 0)) {
                    return res.status(400).send({ status: false, message: "Invalid request parameter, please provide profile image" })
                }
            }
        }
        // let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            // res.status(201).send({ status: true, data: uploadedFileURL });
            if (uploadedFileURL) {
                updateUserData['profileImage'] = uploadedFileURL
            }
        }
        const updatedUserData = await UserModel.findOneAndUpdate({ _id: userId }, updateUserData, { new: true })
        res.status(201).send({ status: true, data: updatedUserData })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.update = update
module.exports.registerUser = registerUser
module.exports.login = login
module.exports.GetUsers = GetUsers