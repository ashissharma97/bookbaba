module.exports={
    ensureAuthenticated:(req,res,next)=>{
        if(req.isAuthenticated()){
            return next()
        }
        else{
            req.flash('error','Please Login to View this Page')
            res.redirect('/login')
        }
    },
    notAuthenticated:(req,res,next)=>{
        if(req.isAuthenticated()){
            req.flash('error','Please Logout to View this Page')
            res.redirect('/dashboard')
        }
        else{
            return next()
        }
    }
}