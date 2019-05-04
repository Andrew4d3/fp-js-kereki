const once = require("./once");

describe("once", () => {
  beforeEach(() => {
    global.myFn = () => {};
    spyOn(global, "myFn");
  });

  /* We test this to verify the origial function runs correctly when we call it multiple times */
  it("without 'once', a function always runs", () => {
    myFn();
    myFn();
    myFn();
    expect(myFn).toHaveBeenCalledTimes(3);
  });

  /* Now we test the once high order function */
  it("with 'once', a function runs one time", () => {
    global.onceFn = once(global.myFn);
    spyOn(global, "onceFn").and.callThrough();
    onceFn();
    onceFn();
    onceFn();
    expect(onceFn).toHaveBeenCalledTimes(3); // The high order function is called 3 times
    expect(myFn).toHaveBeenCalledTimes(1); // But the inner (original) function is just called once
  });
});
