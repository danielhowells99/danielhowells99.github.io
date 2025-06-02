function RK4(f,t,y,h = 0.005){
    let yp = (k,h) => y.map((y,i) => y + (h)*k[i])
    let k1 = f(t,y)
    let k2 = f(t+h/2,yp(k1,h/2))
    let k3 = f(t+h/2,yp(k2,h/2))
    let k4 = f(t+h/2,yp(k3,h))

    const sixth = 1.0/6.0;
    return (new Array(y.length).fill(0)).map((a,i) => sixth*(k1[i]+2*k2[i]+2*k3[i]+k4[i]))
}

export {RK4}