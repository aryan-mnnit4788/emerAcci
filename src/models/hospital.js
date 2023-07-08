require('dotenv').config();
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')







class MyDouble extends mongoose.SchemaType {
    constructor(key, options) {
        super(key, options, 'MyDouble')
    }

    cast(val) {
        let asNumber = Number(val)
        if (isNaN(asNumber)) {
            throw new Error('MyDouble: ' + val + ' is not a number')
        }
        asNumber = mongoose.mongo.Double(asNumber)
        return asNumber
    }
}

mongoose.Schema.Types.MyDouble = MyDouble


const secret = "hbfvrhbfiuh"
const hospitalSchema = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: true

    },
    address: {
        type: String,
        required: true

    },


    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                console.log("hello")
                throw new Error('Invalid email')

            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    location:{
        type:{
            type:String,
            enum: ['Point'],
            default:"Point"

        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
          

        }
    },

    savedMessages: [{
        id: {
            type: String

        }
    }],
    bloodBank: {
        Op: {
            type: String,
            default: "Unavailable"
        },
        On: {
            type: String,
            default: "Unavailable"
        },
        Ap: {
            type: String,
            default: "Unavailable"
        },
        An: {
            type: String,
            default: "Unavailable"
        },
        ABp: {
            type: String,
            default: "Unavailable"
        },
        ABn: {
            type: String,
            default: "Unavailable"
        },
        Bp: {
            type: String,
            default: "Unavailable"
        },
        Bn: {
            type: String,
            default: "Unavailable"
        }











    }

})

hospitalSchema.index({ location: "2dsphere" });

hospitalSchema.methods.getPublicProfile = async function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens
    //console.log(userObject.username)
    return userObject;
}



hospitalSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;

}



hospitalSchema.statics.findByCredentials = async (email, password) => {
    const user = await Hospital.findOne({ email: email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
}


hospitalSchema.statics.searchNearbyHospitals= async (longitude,latitude)=>{


    const data = await Hospital.find(
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
              },
              $maxDistance: 30000
            }
          }
        },
        {
          name: 1,
          address: 1,
          distanceField: { $multiply: [{ $meta: "geoNearDistance" }, 0.00062137119] } // Convert meters to miles
        }
      ).lean({ virtuals: true });
      
      return data;
      

}






hospitalSchema.methods.getPublicProfile = async function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens
    //console.log(userObject.username)
    return userObject;
}









hospitalSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next();
})

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital
